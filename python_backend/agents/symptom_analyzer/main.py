from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
import requests
from .fhir_connector import FHIRConnector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Symptom Analyzer Agent API")

# Initialize FHIR connector
fhir_connector = FHIRConnector()

class SemanticContext(BaseModel):
    intent: str
    identified_concepts: List[str]
    confidence: float
    temporal_context: Optional[Dict[str, Any]] = None
    severity_indicators: Optional[List[str]] = None

class SymptomAnalyzerRequest(BaseModel):
    symptoms_text: str
    semantic_context: Optional[SemanticContext] = None
    priority: Optional[str] = "medium"
    patient_id: Optional[str] = None  # Added patient_id for FHIR lookups

class SemanticAnalysis(BaseModel):
    temporal_info: Dict[str, Any] = Field(default_factory=dict)
    severity_assessment: str
    contextual_factors: List[str] = Field(default_factory=list)
    confidence_factors: Dict[str, float] = Field(default_factory=dict)
    fhir_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
class FHIRContext(BaseModel):
    patient_history: Optional[Dict[str, Any]] = None
    previous_symptoms: Optional[List[str]] = None
    historical_severity: Optional[str] = None
    
class SymptomAnalysisResult(BaseModel):
    identified_symptoms: List[str]
    confidence: float
    severity_level: str
    semantic_analysis: Optional[SemanticAnalysis] = None
    fhir_context: Optional[FHIRContext] = None  # Added FHIR context
    patient_id: Optional[str] = None  # Added patient ID field

class SymptomAnalyzerResponse(BaseModel):
    result: Optional[SymptomAnalysisResult] = None
    error: Optional[str] = None
    patient_id: Optional[str] = None  # Added to ensure patient ID is in the top-level response

@app.post("/analyze_symptoms", response_model=SymptomAnalyzerResponse)
def analyze_symptoms(request: SymptomAnalyzerRequest):
    """
    Analyzes symptoms with semantic understanding and temporal context.
    """
    try:
        logger.info(f"Starting symptom analysis with priority: {request.priority}")
        
        if not request.symptoms_text:
            raise HTTPException(status_code=400, detail="Symptoms text is required")
            
        # Initial context before text analysis
        initial_context = {
            "priority": request.priority,
            "initial_patient_id": request.patient_id,
            "has_semantic_context": bool(request.semantic_context)
        }
        logger.info(f"Initial request context: {initial_context}")

        if request.patient_id:
            logger.info(f"Processing request for patient: {request.patient_id}")
            
        if request.semantic_context:
            logger.info(f"Semantic context available with intent: {request.semantic_context.intent} and confidence: {request.semantic_context.confidence}")
            if request.semantic_context.severity_indicators:
                logger.info(f"Severity indicators from context: {request.semantic_context.severity_indicators}")

        logger.info("Beginning symptom extraction and analysis")
        
        # Initialize data structures
        identified_symptoms = []
        semantic_analysis = SemanticAnalysis(
            temporal_info={},
            severity_assessment="unknown",
            contextual_factors=[],
            confidence_factors={},
            fhir_data={}
        )
        
        # Extract text and semantic context
        text = request.symptoms_text.lower()
        semantic_context = request.semantic_context
        
        # Extract patient ID if present in text using multiple formats
        patient_id = None
        text_lower = text.lower()
        original_text = text  # Keep original for logging
        
        logger.info(f"Processing text for patient ID: '{text_lower}'")
        
        # Normalize text by removing extra spaces around punctuation
        text_normalized = text_lower
        for punct in [':', ';', ',', '-', '_']:
            text_normalized = text_normalized.replace(f' {punct}', punct)
            text_normalized = text_normalized.replace(f'{punct} ', punct)
        
        logger.info(f"Normalized text: '{text_normalized}'")
        
        # Common patterns for patient ID (with variations)
        base_patterns = [
            "patient id",
            "patientid",
            "patient",
            "id",
            "patient number",
            "patient#",
            "pid",
            "p#"
        ]
        
        # Generate variations of patterns
        patterns = []
        for base in base_patterns:
            patterns.append(f"{base}:")  # with colon
            patterns.append(f"{base}=")  # with equals
            patterns.append(f"{base} ")  # with space
            
        logger.info(f"Checking {len(patterns)} pattern variations")
        
        # Try to find patient ID using various patterns
        for pattern in patterns:
            pattern = pattern.strip()
            logger.info(f"Checking pattern: '{pattern}'")
            if pattern in text_normalized:
                logger.info(f"Found pattern '{pattern}' in text")
                parts = text_normalized.split(pattern, 1)  # Split only on first occurrence
                if len(parts) > 1:
                    # Extract potential ID and clean up surrounding text
                    potential_text = parts[1].strip()
                    logger.info(f"Text after pattern: '{potential_text}'")
                    
                    # Extract first word as potential ID
                    words = potential_text.split()
                    if words:
                        potential_id = words[0]
                        logger.info(f"Potential ID found: '{potential_id}'")
                        
                        # Clean up the ID
                        clean_id = potential_id.strip(",:;-_#= ")
                        logger.info(f"Cleaned ID: '{clean_id}'")
                        
                        # Validate ID format
                        if clean_id:
                            # Convert to uppercase and add P prefix if missing
                            patient_id = clean_id.upper()
                            if not patient_id.startswith('P'):
                                patient_id = f"P{patient_id}"
                            logger.info(f"Formatted patient ID: '{patient_id}'")
                            
                            # Remove the ID part from symptom text
                            remaining_text = " ".join(potential_text.split()[1:])
                            text = (parts[0].strip() + " " + remaining_text).strip()
                            
                            logger.info(f"Successfully extracted patient ID: '{patient_id}'")
                            logger.info(f"Remaining symptom text: '{text}'")
                            break
                        else:
                            logger.info(f"Invalid ID format: '{clean_id}'")
                    else:
                        logger.info("No words found after pattern")
        
        # Log the ID extraction results
        logger.info(f"ID from request: {request.patient_id}")
        logger.info(f"ID extracted from text: {patient_id}")
        
        # Use provided patient ID if available, otherwise use extracted one
        final_patient_id = request.patient_id or patient_id
        if final_patient_id:
            # Ensure consistent format
            if not final_patient_id.startswith('P'):
                final_patient_id = f"P{final_patient_id}"
            logger.info(f"Using final patient ID: {final_patient_id}")
            
            # Update request context log
            request_context = {
                'priority': request.priority,
                'has_patient_id': True,
                'patient_id': final_patient_id,
                'id_source': 'request' if request.patient_id else 'text'
            }
            logger.info(f"Updated request context: {request_context}")
        else:
            logger.info("No patient ID found in request or text")
        
        # Store the final patient ID for use in the rest of the function
        patient_id = final_patient_id
        
        # Update the text if we extracted an ID
        if patient_id and text != original_text:
            logger.info(f"Text after ID removal: '{text}'")
        
        # Enhanced symptom mapping with severity indicators and more comprehensive matching
        symptom_map = {
            'headache': {
                'keywords': ['headache', 'head pain', 'head ache', 'migraine', 'head hurts', 'pounding head'],
                'severity_indicators': ['severe', 'intense', 'mild', 'throbbing', 'pounding', 'terrible', 'worst', 'unbearable', 'slight'],
                'temporal_patterns': ['constant', 'intermittent', 'sudden', 'all day', 'since morning', 'keeps coming back'],
                'severity_weights': {
                    'unbearable': 1.0,
                    'worst': 1.0,
                    'terrible': 0.9,
                    'severe': 0.8,
                    'intense': 0.8,
                    'throbbing': 0.7,
                    'pounding': 0.7,
                    'moderate': 0.5,
                    'mild': 0.3,
                    'slight': 0.2
                }
            },
            'nausea': {
                'keywords': ['nausea', 'nauseous', 'feeling sick', 'want to vomit', 'queasy', 'stomach turning'],
                'severity_indicators': ['severe', 'mild', 'overwhelming', 'intense', 'constant', 'comes and goes'],
                'temporal_patterns': ['after eating', 'morning', 'constant', 'all day', 'when moving'],
                'severity_weights': {
                    'overwhelming': 1.0,
                    'severe': 0.8,
                    'intense': 0.8,
                    'constant': 0.7,
                    'moderate': 0.5,
                    'mild': 0.3
                }
            },
            'fever': {
                'keywords': ['fever', 'high temperature', 'temperature', 'running hot', 'feel hot', 'burning up'],
                'severity_indicators': ['high', 'low-grade', 'mild', 'severe', 'extreme', 'burning'],
                'temporal_patterns': ['persistent', 'intermittent', 'night', 'all day', 'comes and goes'],
                'severity_weights': {
                    'extreme': 1.0,
                    'very high': 0.9,
                    'high': 0.8,
                    'burning': 0.7,
                    'moderate': 0.5,
                    'low-grade': 0.3,
                    'mild': 0.2
                }
            },
            'cough': {
                'keywords': ['cough', 'coughing', 'chest cough', 'dry cough', 'hacking', 'clearing throat'],
                'severity_indicators': ['severe', 'mild', 'dry', 'wet', 'productive', 'hacking', 'constant'],
                'temporal_patterns': ['persistent', 'intermittent', 'night', 'morning', 'all day', 'when talking'],
                'severity_weights': {
                    'severe': 0.9,
                    'hacking': 0.8,
                    'constant': 0.7,
                    'productive': 0.6,
                    'wet': 0.5,
                    'dry': 0.4,
                    'mild': 0.3
                }
            },
            'fatigue': {
                'keywords': ['fatigue', 'tired', 'exhausted', 'no energy', 'weakness', 'drained', 'lethargic'],
                'severity_indicators': ['severe', 'mild', 'extreme', 'complete', 'overwhelming', 'constant'],
                'temporal_patterns': ['constant', 'morning', 'evening', 'after activity', 'all day', 'getting worse'],
                'severity_weights': {
                    'extreme': 1.0,
                    'overwhelming': 0.9,
                    'severe': 0.8,
                    'complete': 0.8,
                    'constant': 0.7,
                    'moderate': 0.5,
                    'mild': 0.3
                }
            },
            'sore throat': {
                'keywords': ['sore throat', 'throat pain', 'throat ache', 'painful throat', 'scratchy throat', 'throat hurts'],
                'severity_indicators': ['severe', 'mild', 'burning', 'very sore', 'scratchy', 'raw'],
                'temporal_patterns': ['constant', 'morning', 'night', 'when swallowing', 'after talking', 'getting worse'],
                'severity_weights': {
                    'severe': 0.9,
                    'very sore': 0.8,
                    'burning': 0.7,
                    'raw': 0.6,
                    'scratchy': 0.5,
                    'mild': 0.3
                }
            },
            # Add more symptoms with detailed attributes
        }

        # Initialize semantic analysis
        semantic_analysis = SemanticAnalysis(
            temporal_info={},
            severity_assessment="unknown",
            contextual_factors=[],
            confidence_factors={},
            fhir_data={}
        )

        # Extract symptoms first before FHIR integration
        # Enhanced symptom extraction using semantic context
        identified_symptoms = []  # Clear the list to avoid duplicates
        symptom_details = {}  # Store detailed information about each symptom
        
        for symptom, info in symptom_map.items():
            # Check for symptom keywords
            matching_keywords = [kw for kw in info['keywords'] if kw in text]
            if matching_keywords:
                if symptom not in identified_symptoms:  # Avoid duplicates
                    identified_symptoms.append(symptom)
                    symptom_details[symptom] = {'keywords': matching_keywords}
                
                # Analyze severity for this symptom
                severity_indicators = [ind for ind in info['severity_indicators'] if ind in text]
                if severity_indicators:
                    semantic_analysis.contextual_factors.extend(severity_indicators)
                    symptom_details[symptom]['severity_indicators'] = severity_indicators
                
                # Analyze temporal patterns
                temporal_patterns = [pat for pat in info['temporal_patterns'] if pat in text]
                if temporal_patterns:
                    semantic_analysis.temporal_info[symptom] = temporal_patterns
                    symptom_details[symptom]['temporal_patterns'] = temporal_patterns
                    
        logger.info(f"Initial symptoms extracted: {identified_symptoms}")
        logger.info(f"Symptom details: {symptom_details}")
        
        logger.info(f"Initial symptoms identified: {identified_symptoms}")

        # Enhanced FHIR integration
        fhir_context = FHIRContext()
        using_patient_context = bool(patient_id)
        
        # Log the analysis path and context
        logger.info(f"Final patient ID for analysis: {patient_id}")
        logger.info(f"Analysis path: {'with patient context' if using_patient_context else 'without patient context'}")
        
        # Update request context after patient ID processing
        final_context = {
            "priority": request.priority,
            "has_patient_id": using_patient_context,
            "patient_id": patient_id if using_patient_context else None,
            "has_semantic_context": bool(request.semantic_context)
        }
        logger.info(f"Final analysis context: {final_context}")

        # FHIR Integration
        if using_patient_context:
            logger.info(f"Enriching symptoms with FHIR data for patient {patient_id}")
            try:
                # Get patient history through FHIR connector
                fhir_data = fhir_connector.enrich_symptoms(identified_symptoms, patient_id)
                
                if fhir_data['has_patient_history']:
                    # Process FHIR data for previous symptoms and severity
                    previous_symptoms = []
                    historical_severity = "unknown"
                    severe_count = 0
                    moderate_count = 0
                    
                    # Extract relevant symptom history
                    for record in fhir_data['symptom_history']:
                        if record['symptom']:
                            previous_symptoms.append(record['symptom'])
                            if record['severity'] == 'severe':
                                severe_count += 1
                            elif record['severity'] == 'moderate':
                                moderate_count += 1
                    
                    # Determine overall historical severity
                    if severe_count > 0:
                        historical_severity = 'high'
                    elif moderate_count > 0:
                        historical_severity = 'medium'
                    elif previous_symptoms:
                        historical_severity = 'low'
                    
                    # Update FHIR context with enriched data
                    fhir_context.patient_history = fhir_data
                    fhir_context.previous_symptoms = previous_symptoms
                    fhir_context.historical_severity = historical_severity
                    
                    # Add historical context to semantic analysis
                    semantic_analysis.temporal_info['patient_history'] = {
                        'previous_symptoms': previous_symptoms,
                        'historical_severity': historical_severity,
                        'last_recorded': fhir_data['last_recorded_date'],
                        'symptom_recurrence': {
                            'severe_count': severe_count,
                            'moderate_count': moderate_count,
                            'total_records': len(previous_symptoms)
                        }
                    }
                    
                    # Add related conditions if any
                    if fhir_data['related_conditions']:
                        semantic_analysis.contextual_factors.extend(
                            [f"related condition: {cond}" for cond in fhir_data['related_conditions']]
                        )
                    
                    # Adjust severity based on historical patterns
                    matching_symptoms = set(identified_symptoms).intersection(set(previous_symptoms))
                    if matching_symptoms:
                        if historical_severity == 'high' and len(matching_symptoms) >= 2:
                            logger.info("Increasing severity due to recurring severe symptoms")
                            severity = 'high'
                            semantic_analysis.confidence_factors['historical_severity'] = 0.9
                            semantic_analysis.contextual_factors.append("history of severe symptoms")
                        
                        # Add confidence boost based on historical matches
                        confidence_boost = min(0.9, 0.6 + (len(matching_symptoms) * 0.1))
                        semantic_analysis.confidence_factors['historical_match'] = confidence_boost
                        logger.info(f"Historical match confidence boost: {confidence_boost} from {len(matching_symptoms)} symptoms")
                    
                    logger.info(f"FHIR enrichment complete - Found {len(previous_symptoms)} historical symptoms")
                else:
                    logger.info("No patient history found in FHIR data")
                    semantic_analysis.confidence_factors['no_history'] = 0.5
                
            except Exception as e:
                logger.error(f"FHIR enrichment failed: {str(e)}")
                semantic_analysis.confidence_factors['fhir_lookup_failed'] = 0.4
        else:
            logger.info("Analyzing symptoms without patient context")
            semantic_analysis.confidence_factors['no_patient_context'] = 0.5

        # Enhanced symptom extraction using semantic context
        unique_symptoms = set(identified_symptoms)  # Start with existing symptoms
        for symptom, info in symptom_map.items():
            # Check for symptom keywords if not already identified
            if symptom not in unique_symptoms and any(keyword in text for keyword in info['keywords']):
                unique_symptoms.add(symptom)
                
                # Analyze severity for this symptom
                severity_indicators = [ind for ind in info['severity_indicators'] if ind in text]
                if severity_indicators:
                    semantic_analysis.contextual_factors.extend(severity_indicators)
                
                # Analyze temporal patterns
                temporal_patterns = [pat for pat in info['temporal_patterns'] if pat in text]
                if temporal_patterns:
                    semantic_analysis.temporal_info[symptom] = temporal_patterns
        
        # Update identified_symptoms with unique symptoms
        identified_symptoms = list(unique_symptoms)

        # Use semantic context if available
        if semantic_context:
            # Add temporal context from semantic understanding
            if semantic_context.temporal_context:
                semantic_analysis.temporal_info.update(semantic_context.temporal_context)
            
            # Add severity indicators from semantic understanding
            if semantic_context.severity_indicators:
                semantic_analysis.contextual_factors.extend(semantic_context.severity_indicators)

        # Enhanced severity determination using weights and context
        severity = "unknown"
        confidence = 0.5
        severity_scores = []
        
        # Check each identified symptom for severity indicators in text
        for symptom in identified_symptoms:
            symptom_info = symptom_map[symptom]
            max_severity_score = 0
            
            # Check each severity indicator in text
            for indicator in symptom_info['severity_indicators']:
                if indicator in text:
                    severity_score = symptom_info['severity_weights'].get(indicator, 0.5)
                    max_severity_score = max(max_severity_score, severity_score)
            
            if max_severity_score > 0:
                severity_scores.append(max_severity_score)
        
        # Calculate average severity score if we have any
        if severity_scores:
            avg_severity_score = sum(severity_scores) / len(severity_scores)
            
            # Determine severity level based on average score
            if avg_severity_score >= 0.8:
                severity = "high"
                confidence = 0.9
            elif avg_severity_score >= 0.5:
                severity = "medium"
                confidence = 0.8
            else:
                severity = "low"
                confidence = 0.7
        else:
            # Fallback to symptom count and semantic context
            if semantic_context and semantic_context.severity_indicators:
                # Use semantic understanding
                severity_indicators = semantic_context.severity_indicators
                if any(indicator in ['severe', 'intense', 'extreme', 'unbearable', 'worst'] for indicator in severity_indicators):
                    severity = "high"
                    confidence = 0.9
                elif any(indicator in ['moderate', 'medium', 'significant'] for indicator in severity_indicators):
                    severity = "medium"
                    confidence = 0.8
                else:
                    severity = "low"
                    confidence = 0.7
            else:
                # Last resort: use symptom count
                if len(identified_symptoms) >= 4:
                    severity = "high"
                    confidence = 0.8
                elif len(identified_symptoms) >= 2:
                    severity = "medium"
                    confidence = 0.7
                else:
                    severity = "low"
                    confidence = 0.6

        # Check FHIR data for historical severe symptoms
        if using_patient_context and fhir_context.patient_history:
            fhir_data = fhir_context.patient_history
            if fhir_data.get('matching_symptoms'):
                for match in fhir_data['matching_symptoms']:
                    if match.get('severity') == 'severe':
                        logger.info(f"Found severe historical record for {match.get('symptom')}")
                        severity = 'high'
                        confidence = 0.9
                        semantic_analysis.contextual_factors.append(f"historical severe {match.get('symptom')}")
                        break

        # Update semantic analysis with final severity assessment
        semantic_analysis.severity_assessment = severity
        semantic_analysis.confidence_factors.update({
            "symptom_count": len(set(identified_symptoms)) / 10,  # Normalize to 0-1 using unique symptoms
            "severity_assessment": confidence
        })

        # Calculate overall confidence based on all factors
        semantic_analysis.confidence_factors["semantic_context_confidence"] = (
            semantic_context.confidence if semantic_context else 0.5
        )
        
        # Add confidence factors for patient history
        semantic_analysis.confidence_factors['has_patient_history'] = 1.0 if using_patient_context else 0.0
        if using_patient_context and fhir_context.patient_history:
            semantic_analysis.confidence_factors['fhir_data_quality'] = 0.8
        
        # Calculate final confidence
        overall_confidence = sum(semantic_analysis.confidence_factors.values()) / len(semantic_analysis.confidence_factors)
        
        # Create final result with FHIR context, using set() to remove duplicates
        result = SymptomAnalysisResult(
            identified_symptoms=list(set(identified_symptoms)),
            confidence=overall_confidence,
            severity_level=severity,
            semantic_analysis=semantic_analysis,
            fhir_context=fhir_context,
            patient_id=patient_id  # Include the patient ID in the result
        )

        # Log the final result details
        logger.info(f"Analysis complete for patient {patient_id if patient_id else 'without ID'}")
        logger.info(f"Symptoms identified: {identified_symptoms}")
        logger.info(f"Severity level: {severity}")
        logger.info(f"Using FHIR data: {using_patient_context}")
        logger.info(f"Final result patient_id: {result.patient_id}")  # Log patient ID in result
        
        if using_patient_context:
            logger.info(f"FHIR context details: historical_severity={fhir_context.historical_severity}, "
                     f"previous_symptoms_count={len(fhir_context.previous_symptoms or [])}")

        # Create response with both result and patient_id at top level
        response = SymptomAnalyzerResponse(
            result=result,
            patient_id=patient_id  # Include patient ID at top level of response
        )
        logger.info(f"Sending response with patient_id: {patient_id}")
        return response
    except HTTPException as he:
        logger.error(f"HTTP error in symptom analysis: {str(he)}")
        return SymptomAnalyzerResponse(error=str(he))
    except requests.RequestException as re:
        logger.error(f"FHIR request failed: {str(re)}")
        return SymptomAnalyzerResponse(error=f"Failed to fetch FHIR data: {str(re)}")
    except Exception as e:
        logger.error(f"Unexpected error in symptom analysis: {str(e)}", exc_info=True)
        return SymptomAnalyzerResponse(error="An unexpected error occurred during symptom analysis")

@app.get("/health")
def health_check():
    return {"status": "healthy"}