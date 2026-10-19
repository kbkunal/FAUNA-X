"""
FAUNA-X: Pydantic Data Schemas
Defines request validation and serialized API response contracts across
authentication, case management, AI intelligence, GIS, laboratory, and surveillance.
"""
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ================= AUTH SCHEMAS =================
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: str = "FARMER"
    district: Optional[str] = None
    state: Optional[str] = None
    village: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    district: Optional[str] = None
    state: Optional[str] = None
    village: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ================= AI INTELLIGENCE & EXPLAINABILITY SCHEMAS =================
class VisualIndicator(BaseModel):
    label: str
    name: str
    description: str
    confidence: float
    detected: bool

class AlternativePrediction(BaseModel):
    class_: str = Field(alias="class")
    display_name: str
    confidence: float
    percentage: float

class AIPredictionResponse(BaseModel):
    id: Optional[int] = None
    model_name: str
    model_version: str
    task: str
    prediction_class: str
    display_name: str
    confidence: float
    percentage: float
    is_low_confidence: bool
    status_text: str
    visual_indicators: Optional[List[Dict[str, Any]]] = None
    alternatives: Optional[List[Dict[str, Any]]] = None
    all_probabilities: Optional[Dict[str, float]] = None
    shap_factors: Optional[List[Dict[str, Any]]] = None
    requires_verification: bool = True
    validation_status: Optional[str] = "PROTOTYPE_NOT_CLINICALLY_VALIDATED"
    clinical_disclaimer: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ================= CASE SCHEMAS =================
class SymptomResponse(BaseModel):
    id: Optional[int] = None
    symptom_name: str
    severity: Optional[str] = "Moderate"
    source: Optional[str] = "FARMER_REPORT"
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class SymptomInput(BaseModel):
    symptom_name: str
    severity: str = "Moderate"
    source: str = "FARMER_REPORT"
    notes: Optional[str] = None

class CaseCreate(BaseModel):
    species: str = "Cattle"
    breed: Optional[str] = None
    age: Optional[Union[str, int, float]] = None
    age_months: Optional[int] = None
    sex: Optional[str] = None
    number_affected: int = 1
    symptoms: List[Union[SymptomInput, str, Dict[str, Any]]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    temperature_c: Optional[float] = None
    appetite_status: Optional[str] = None
    mobility_status: Optional[str] = None
    duration_days: Optional[int] = 3
    voice_transcript: Optional[str] = None
    history: Optional[Dict[str, Any]] = None
    history_data: Optional[Dict[str, Any]] = None

class CaseImageResponse(BaseModel):
    id: int
    storage_path: str
    original_filename: Optional[str] = None
    quality_score: float
    is_blurry: bool
    created_at: datetime

    class Config:
        from_attributes = True

class VerificationResponse(BaseModel):
    id: int
    veterinarian_id: int
    status: str
    preliminary_diagnosis: Optional[str] = None
    observed_symptoms: Optional[List[str]] = None
    clinical_findings: Optional[str] = None
    severity: str
    sample_required: bool
    containment_required: bool
    vaccination_required: bool
    treatment_prescribed: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LabRecordResponse(BaseModel):
    id: int
    case_id: int
    sample_id: str
    sample_type: str
    collection_date: datetime
    lab_name: str
    test_method: str
    status: str
    confirmed_pathogen: Optional[str] = None
    result_date: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class CaseDetailResponse(BaseModel):
    id: int
    case_number: str
    farmer_id: int
    species: str
    breed: Optional[str] = None
    age_months: Optional[int] = None
    sex: Optional[str] = None
    number_affected: int
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    temperature_c: Optional[float] = None
    appetite_status: Optional[str] = None
    mobility_status: Optional[str] = None
    duration_days: Optional[int] = 3
    voice_transcript: Optional[str] = None
    ai_risk_score: Optional[float] = 0.0
    ai_risk_tier: Optional[str] = "LOW"
    ai_triage_priority: Optional[str] = "ROUTINE"
    ai_confidence: Optional[float] = 0.0
    offline_sync_status: Optional[str] = "SYNCED"
    history_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    symptoms: List[SymptomResponse] = []
    images: List[CaseImageResponse] = []
    ai_predictions: List[AIPredictionResponse] = []
    verification: Optional[VerificationResponse] = None
    lab_records: List[LabRecordResponse] = []

    class Config:
        from_attributes = True

# ================= VETERINARIAN & LAB ACTION SCHEMAS =================
class VerificationCreate(BaseModel):
    status: str = "VERIFIED"  # VERIFIED, REJECTED, MORE_INFO_REQUESTED
    preliminary_diagnosis: Optional[str] = None
    clinical_findings: str
    severity: str = "Moderate"
    sample_required: bool = False
    containment_required: bool = False
    vaccination_required: bool = False
    treatment_prescribed: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None

class LabRecordCreate(BaseModel):
    case_id: int
    sample_id: str
    sample_type: str = "Blood"
    lab_name: str
    test_method: str = "RT-PCR"
    status: str = "PROCESSING"
    confirmed_pathogen: Optional[str] = None
    notes: Optional[str] = None

class FieldVisitCreate(BaseModel):
    scheduled_date: datetime
    notes: Optional[str] = None

class VaccinationCreate(BaseModel):
    animal_id: Optional[int] = None
    disease_name: str
    vaccine_batch: Optional[str] = None
    administered_date: Optional[datetime] = None
    next_due_date: Optional[datetime] = None
    district: Optional[str] = None
    state: Optional[str] = None

# ================= GIS & SURVEILLANCE SCHEMAS =================
class MapCasePoint(BaseModel):
    id: int
    case_number: str
    species: str
    status: str
    latitude: float
    longitude: float
    village: Optional[str] = None
    district: Optional[str] = None
    ai_risk_tier: Optional[str] = "LOW"
    ai_risk_score: Optional[float] = 0.0
    top_prediction: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime

class ClusterPoint(BaseModel):
    cluster_code: str
    centroid: Dict[str, float]
    radius_km: float
    case_count: int
    primary_species: str
    risk_level: str
    status: str
    recommended_action: str

class OutbreakForecastResponse(BaseModel):
    model_name: str
    model_version: str
    validation_status: str
    district: str
    forecast_risk_level: str
    trend: str
    growth_rate_pct: float
    vaccination_coverage_pct: float
    active_cluster_count: int
    projected_cases: Dict[str, float]
    trajectory: List[Dict[str, Any]]
    key_drivers: List[str]
    recommended_interventions: List[str]
    disclaimer: str

class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    priority: str
    district: Optional[str] = None
    state: Optional[str] = None
    case_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
