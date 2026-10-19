"""
FAUNA-X: NLP Symptom Extraction Pipeline
Extracts standardized symptoms from speech transcripts and textual field notes
using a controlled vocabulary dictionary with synonym expansion and rule-based token matching.
"""
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

SYMPTOMS_JSON_PATH = Path(__file__).parent.parent / "datasets" / "symptoms.json"

class SymptomExtractor:
    def __init__(self, vocabulary_path: Optional[Path] = None):
        path = vocabulary_path or SYMPTOMS_JSON_PATH
        self.vocabulary: List[Dict[str, Any]] = []
        self.alias_to_symptom: Dict[str, Dict[str, Any]] = {}
        self.symptom_map: Dict[str, Dict[str, Any]] = {}
        
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.vocabulary = data.get("symptoms", [])
                for sym in self.vocabulary:
                    self.symptom_map[sym["symptom_id"]] = sym
                    # Index all aliases
                    for alias in sym.get("aliases", []):
                        self.alias_to_symptom[alias.lower().strip()] = sym
                    self.alias_to_symptom[sym["name"].lower().strip()] = sym
        else:
            # Fallback default vocabulary
            self._init_fallback_vocabulary()

    def _init_fallback_vocabulary(self):
        default_syms = [
            {"symptom_id": "SYM_SKIN_NODULES", "name": "Nodular Skin Lesions", "aliases": ["skin nodules", "lumps", "bumps", "skin rash", "gaanth"], "severity_score": 0.85, "applicable_species": ["Cattle", "Buffalo"], "high_priority_trigger": True},
            {"symptom_id": "SYM_FEVER", "name": "High Fever", "aliases": ["fever", "high temperature", "hot body", "bukhar"], "severity_score": 0.70, "applicable_species": ["Cattle", "Buffalo", "Goat", "Sheep"], "high_priority_trigger": False},
            {"symptom_id": "SYM_ORAL_ULCERS", "name": "Oral Ulcers / Drooling", "aliases": ["mouth ulcers", "blisters in mouth", "salivation", "drooling", "foam from mouth"], "severity_score": 0.90, "applicable_species": ["Cattle", "Buffalo", "Goat"], "high_priority_trigger": True},
            {"symptom_id": "SYM_FOOT_LESIONS", "name": "Foot Lesions / Lameness", "aliases": ["foot sores", "hoof blisters", "limping", "lameness", "foot rot"], "severity_score": 0.85, "applicable_species": ["Cattle", "Buffalo", "Goat", "Sheep"], "high_priority_trigger": True},
            {"symptom_id": "SYM_APPETITE_LOSS", "name": "Loss of Appetite", "aliases": ["not eating", "loss of appetite", "off feed", "khana band"], "severity_score": 0.50, "applicable_species": ["Cattle", "Buffalo", "Goat", "Sheep"], "high_priority_trigger": False},
            {"symptom_id": "SYM_MILK_DROP", "name": "Drop in Milk Yield", "aliases": ["milk drop", "no milk", "reduced milk"], "severity_score": 0.60, "applicable_species": ["Cattle", "Buffalo"], "high_priority_trigger": False},
            {"symptom_id": "SYM_RESPIRATORY_DISTRESS", "name": "Respiratory Distress", "aliases": ["fast breathing", "coughing", "gasping", "labored breathing"], "severity_score": 0.85, "applicable_species": ["Cattle", "Buffalo", "Goat"], "high_priority_trigger": True}
        ]
        self.vocabulary = default_syms
        for sym in self.vocabulary:
            self.symptom_map[sym["symptom_id"]] = sym
            for alias in sym["aliases"]:
                self.alias_to_symptom[alias.lower().strip()] = sym
            self.alias_to_symptom[sym["name"].lower().strip()] = sym

    def extract_from_text(self, text: str, species: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses text and matches tokens against controlled symptom dictionary.
        Returns matched symptoms, severity summary, and unmapped tokens.
        """
        if not text or not text.strip():
            return {
                "transcript": text or "",
                "extracted_symptoms": [],
                "symptom_flags": {},
                "severity_score_sum": 0.0,
                "has_high_priority_trigger": False,
                "extractor_version": "1.0.0-rules"
            }

        cleaned_text = text.lower()
        extracted: List[Dict[str, Any]] = []
        symptom_flags: Dict[str, bool] = {}
        matched_ids = set()
        severity_sum = 0.0
        has_critical = False

        # Match multi-word aliases first, then single words
        sorted_aliases = sorted(self.alias_to_symptom.keys(), key=lambda k: len(k), reverse=True)
        
        for alias in sorted_aliases:
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, cleaned_text):
                sym_obj = self.alias_to_symptom[alias]
                sym_id = sym_obj["symptom_id"]
                
                # Check species compatibility if provided
                applicable = sym_obj.get("applicable_species", [])
                if species and applicable and species.capitalize() not in applicable:
                    continue
                
                if sym_id not in matched_ids:
                    matched_ids.add(sym_id)
                    is_critical = sym_obj.get("high_priority_trigger", False)
                    sev = sym_obj.get("severity_score", 0.5)
                    severity_sum += sev
                    if is_critical:
                        has_critical = True

                    extracted.append({
                        "symptom_id": sym_id,
                        "name": sym_obj["name"],
                        "category": sym_obj.get("category", "General"),
                        "matched_trigger": alias,
                        "severity_score": sev,
                        "is_high_priority": is_critical
                    })
                    symptom_flags[sym_id.lower().replace("sym_", "")] = True

        return {
            "transcript": text,
            "extracted_symptoms": extracted,
            "symptom_flags": symptom_flags,
            "symptom_count": len(extracted),
            "severity_score_sum": round(severity_sum, 2),
            "has_high_priority_trigger": has_critical,
            "extractor_version": "1.0.0-rules"
        }

symptom_extractor = SymptomExtractor()
