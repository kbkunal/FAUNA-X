"""
FAUNA-X: Case Management API Routes
Handles health report creation, photographic upload, AI screening trigger,
multimodal risk scoring, explainability computation, and retrieval.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_token
from backend.app.models.models import Case, CaseStatus, CaseSymptom, CaseImage, AIPrediction, User, AuditLog, LabRecord
from backend.app.schemas.schemas import CaseCreate, CaseDetailResponse, AIPredictionResponse
from backend.app.services.vision_service import vision_service
from backend.app.services.risk_service import risk_service
from ai.vision.preprocessing import check_image_quality
from PIL import Image
import io

router = APIRouter(prefix="/cases", tags=["Case Management"])

async def generate_case_number(db: AsyncSession) -> str:
    """Generates sequential FX-YYYY-NNNNN formatted case identifier."""
    year = datetime.utcnow().year
    result = await db.execute(select(Case).order_by(Case.id.desc()).limit(1))
    last_case = result.scalars().first()
    next_seq = 1 if not last_case else (last_case.id + 1)
    return f"FX-{year}-{next_seq:05d}"

@router.post("", response_model=CaseDetailResponse)
async def create_case(
    case_in: CaseCreate,
    token_data: dict = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    case_num = await generate_case_number(db)
    
    # 1. Normalize symptoms
    symptom_names: List[str] = []
    symptom_records = []
    for sym in case_in.symptoms:
        if isinstance(sym, str):
            s_name = sym.strip()
            if s_name:
                symptom_names.append(s_name)
                symptom_records.append({"name": s_name, "severity": "Moderate", "source": "FARMER_REPORT", "notes": None})
        elif isinstance(sym, dict):
            s_name = sym.get("symptom_name", "").strip()
            if s_name:
                symptom_names.append(s_name)
                symptom_records.append({
                    "name": s_name,
                    "severity": sym.get("severity", "Moderate"),
                    "source": sym.get("source", "FARMER_REPORT"),
                    "notes": sym.get("notes")
                })
        else:
            s_name = getattr(sym, "symptom_name", "").strip()
            if s_name:
                symptom_names.append(s_name)
                symptom_records.append({
                    "name": s_name,
                    "severity": getattr(sym, "severity", "Moderate"),
                    "source": getattr(sym, "source", "FARMER_REPORT"),
                    "notes": getattr(sym, "notes", None)
                })

    # 2. Normalize age
    age_months = case_in.age_months
    if age_months is None and case_in.age is not None:
        try:
            val = float(str(case_in.age).split()[0])
            age_months = int(val * 12) if val < 25 else int(val)
        except Exception:
            age_months = 24

    # 3. Location normalization
    loc_name = case_in.location_name or ""
    village = case_in.village or (loc_name.split(",")[0].strip() if loc_name else "Field Location")
    district = case_in.district or ("Nagpur" if "Nagpur" in loc_name else "Nagpur")
    state = case_in.state or "Maharashtra"
    history_dict = case_in.history_data or case_in.history or {}

    risk_output = risk_service.calculate_case_risk(
        case_data={
            "species": case_in.species,
            "age_months": age_months or 24,
            "affected_count": case_in.number_affected,
            "duration_days": case_in.duration_days or 3,
            "symptoms": symptom_names
        }
    )

    new_case = Case(
        case_number=case_num,
        farmer_id=token_data["user_id"],
        species=case_in.species,
        breed=case_in.breed,
        age_months=age_months,
        sex=case_in.sex,
        number_affected=case_in.number_affected,
        status=CaseStatus.SUBMITTED,
        latitude=case_in.latitude or 20.5937,
        longitude=case_in.longitude or 78.9629,
        village=village,
        district=district,
        state=state,
        temperature_c=case_in.temperature_c,
        appetite_status=case_in.appetite_status,
        mobility_status=case_in.mobility_status,
        duration_days=case_in.duration_days or 3,
        voice_transcript=case_in.voice_transcript,
        ai_risk_score=risk_output.get("risk_score", 0.0),
        ai_risk_tier=risk_output.get("risk_level", "LOW"),
        ai_triage_priority=risk_output.get("triage_priority", "ROUTINE"),
        ai_confidence=risk_output.get("confidence", 0.85),
        history_data=history_dict
    )
    db.add(new_case)
    await db.flush()

    # Add symptoms
    for sym_rec in symptom_records:
        case_sym = CaseSymptom(
            case_id=new_case.id,
            symptom_name=sym_rec["name"],
            severity=sym_rec["severity"],
            source=sym_rec["source"],
            notes=sym_rec["notes"]
        )
        db.add(case_sym)

    # Add audit log
    audit = AuditLog(
        user_id=token_data["user_id"],
        action="CASE_CREATED",
        entity_type="Case",
        entity_id=case_num,
        details={
            "species": case_in.species,
            "number_affected": case_in.number_affected,
            "risk_tier": risk_output.get("risk_level", "LOW"),
            "triage_priority": risk_output.get("triage_priority", "ROUTINE")
        }
    )
    db.add(audit)
    
    await db.commit()
    
    # Reload with relationships
    stmt = (
        select(Case)
        .options(
            selectinload(Case.symptoms),
            selectinload(Case.images),
            selectinload(Case.ai_predictions),
            selectinload(Case.verification),
            selectinload(Case.lab_records)
        )
        .where(Case.id == new_case.id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()

@router.post("/{case_id}/image", response_model=AIPredictionResponse)
async def upload_case_image_and_screen(
    case_id: int,
    file: UploadFile = File(...),
    token_data: dict = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch case
    result = await db.execute(select(Case).options(selectinload(Case.symptoms)).where(Case.id == case_id))
    case_obj = result.scalars().first()
    if not case_obj:
        raise HTTPException(status_code=404, detail=f"Case ID {case_id} not found")

    # 2. Save image to disk
    storage_path, image_bytes = await vision_service.save_uploaded_image(file, case_id)

    # 3. Analyze quality
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        quality_audit = check_image_quality(pil_img)
    except Exception:
        quality_audit = {"overall_quality_score": 0.5, "is_blurry": False, "brightness_mean": 128.0}

    # 4. Save CaseImage record
    case_img = CaseImage(
        case_id=case_id,
        storage_path=storage_path,
        original_filename=file.filename,
        mime_type=file.content_type or "image/jpeg",
        size_bytes=len(image_bytes),
        quality_score=quality_audit.get("overall_quality_score", 1.0),
        is_blurry=quality_audit.get("is_blurry", False),
        brightness_mean=quality_audit.get("brightness_mean", 128.0)
    )
    db.add(case_img)
    await db.flush()

    # 5. Execute ACTUAL AI Vision Model Screening
    case_obj.status = CaseStatus.AI_SCREENING
    try:
        screening_result = vision_service.screen_image(
            image_bytes=image_bytes,
            species=case_obj.species.lower()
        )
        pred_data = screening_result["prediction"]

        # Recalculate case risk with visual finding fusion
        symptom_names = [s.symptom_name for s in case_obj.symptoms]
        fused_risk = risk_service.calculate_case_risk(
            case_data={
                "species": case_obj.species,
                "age_months": case_obj.age_months,
                "affected_count": case_obj.number_affected,
                "duration_days": case_obj.duration_days,
                "symptoms": symptom_names
            },
            visual_findings={
                "prediction_class": pred_data["class"],
                "confidence": pred_data["confidence"],
                "quality_score": quality_audit.get("overall_quality_score", 1.0)
            }
        )

        case_obj.ai_risk_score = fused_risk.get("risk_score", 0.0)
        case_obj.ai_risk_tier = fused_risk.get("risk_level", "LOW")
        case_obj.ai_triage_priority = fused_risk.get("triage_priority", "ROUTINE")

        # 6. Save AIPrediction record with SHAP factors
        ai_pred = AIPrediction(
            case_id=case_id,
            image_id=case_img.id,
            model_name=screening_result["model"]["name"],
            model_version=screening_result["model"]["version"],
            task=screening_result["model"]["task"],
            prediction_class=pred_data["class"],
            display_name=pred_data["display_name"],
            confidence=pred_data["confidence"],
            percentage=pred_data["percentage"],
            is_low_confidence=pred_data["is_low_confidence"],
            status_text=pred_data["status"],
            visual_indicators=screening_result.get("visual_indicators"),
            alternatives=screening_result.get("alternatives"),
            all_probabilities=screening_result.get("all_probabilities"),
            shap_factors=fused_risk.get("top_positive_factors", []) + fused_risk.get("top_negative_factors", []),
            requires_verification=screening_result.get("requires_veterinary_verification", True),
            validation_status="CLINICALLY_BENCHMARKED_PILOT",
            clinical_disclaimer=screening_result.get("clinical_disclaimer", "AI-assisted risk estimation. Requires veterinary verification.")
        )
        db.add(ai_pred)
        
        # Advance status to Veterinary Review
        case_obj.status = CaseStatus.VETERINARY_REVIEW

        # Audit Log
        db.add(AuditLog(
            user_id=token_data["user_id"],
            action="AI_VISION_SCREENING_COMPLETED",
            entity_type="Case",
            entity_id=case_obj.case_number,
            details={
                "prediction": pred_data["class"],
                "confidence": pred_data["confidence"],
                "fused_risk_score": case_obj.ai_risk_score,
                "triage_priority": case_obj.ai_triage_priority
            }
        ))

        await db.commit()
        await db.refresh(ai_pred)
        return ai_pred

    except Exception as e:
        case_obj.status = CaseStatus.VETERINARY_REVIEW
        db.add(AuditLog(
            user_id=token_data["user_id"],
            action="AI_VISION_SCREENING_FAILED",
            entity_type="Case",
            entity_id=case_obj.case_number,
            details={"error": str(e)}
        ))
        await db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"AI screening could not be completed: {str(e)}. Veterinary assessment can continue without AI screening."
        )

@router.get("", response_model=List[CaseDetailResponse])
async def list_cases(
    status_filter: Optional[str] = None,
    district_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    token_data: dict = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Case).options(
        selectinload(Case.symptoms),
        selectinload(Case.images),
        selectinload(Case.ai_predictions),
        selectinload(Case.verification),
        selectinload(Case.lab_records)
    ).order_by(Case.created_at.desc())

    # If Farmer, show only own cases
    if token_data["role"] == "FARMER":
        stmt = stmt.where(Case.farmer_id == token_data["user_id"])
    
    if status_filter:
        try:
            enum_status = CaseStatus(status_filter.upper())
            stmt = stmt.where(Case.status == enum_status)
        except ValueError:
            pass

    if district_filter:
        stmt = stmt.where(Case.district.ilike(f"%{district_filter}%"))

    if risk_filter:
        stmt = stmt.where(Case.ai_risk_tier == risk_filter.upper())

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{case_id}", response_model=CaseDetailResponse)
async def get_case(
    case_id: int,
    token_data: dict = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Case).options(
        selectinload(Case.symptoms),
        selectinload(Case.images),
        selectinload(Case.ai_predictions),
        selectinload(Case.verification),
        selectinload(Case.lab_records)
    ).where(Case.id == case_id)

    result = await db.execute(stmt)
    case_obj = result.scalars().first()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    # If Farmer, verify ownership
    if token_data["role"] == "FARMER" and case_obj.farmer_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")

    return case_obj
