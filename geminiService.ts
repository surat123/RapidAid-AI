import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PatientData, AIAnalysisResult, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const triageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    esiLevel: {
      type: Type.INTEGER,
      description: "The Emergency Severity Index level from 1 (Resuscitation) to 5 (Non-urgent).",
    },
    esiDescription: {
      type: Type.STRING,
      description: "A short label for the ESI level (e.g., 'Resuscitation', 'Emergent', 'Urgent').",
    },
    esiReasoning: {
      type: Type.STRING,
      description: "A short, specific explanation of why this ESI level was chosen based on the algorithm (e.g., 'ESI 2 assigned due to high risk of cardiac event and unstable vitals').",
    },
    summary: {
      type: Type.STRING,
      description: "A concise medical summary of the patient's condition based on inputs.",
    },
    recommendedAction: {
      type: Type.STRING,
      description: "Immediate action required (e.g., 'Prepare trauma bay', 'Route to fast track').",
    },
    specialistRequired: {
      type: Type.STRING,
      description: "The type of specialist likely needed (e.g., 'Cardiologist', 'General Surgeon').",
    },
    riskFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of key risk factors identified.",
    },
    infectionRisk: {
      type: Type.BOOLEAN,
      description: "True if symptoms suggest contagious disease (COVID, Flu, TB, etc.) requiring isolation or Test Before Touch.",
    },
    infectionProtocol: {
      type: Type.STRING,
      description: "Specific protocol if infection risk is high (e.g., 'Airborne Precautions', 'Telemedicine Assessment Recommended'). Returns 'None' if low risk.",
    },
    confidenceScore: {
      type: Type.INTEGER,
      description: "A confidence score (0-100) indicating the certainty of the AI's ESI prediction.",
    },
  },
  required: ["esiLevel", "esiDescription", "esiReasoning", "summary", "recommendedAction", "specialistRequired", "riskFactors", "infectionRisk", "infectionProtocol", "confidenceScore"],
};

export const analyzePatientCondition = async (patient: Omit<PatientData, 'id' | 'timestamp' | 'status' | 'aiAnalysis' | 'history'>, language: Language = 'en'): Promise<AIAnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as an expert Emergency Medicine Doctor. Perform a triage assessment for the following patient based on the Emergency Severity Index (ESI) algorithm.
    
    Patient Details:
    - Age: ${patient.age}
    - Gender: ${patient.gender}
    - Chief Complaint/Symptoms: ${patient.symptoms}
    - Medical History: ${patient.medicalHistory}
    - Suggested Specialist (User Input): ${patient.suggestedSpecialist || "None"}
    - Requesting Teleconsult: ${patient.requestTeleconsult ? "Yes" : "No"}
    - Data Source: ${patient.submissionSource}
    - Emergency Contact: ${patient.emergencyContactName || "None"} (${patient.emergencyContactPhone || "N/A"})
    
    Vital Signs:
    - Heart Rate: ${patient.vitals.heartRate} bpm
    - BP: ${patient.vitals.bloodPressureSys}/${patient.vitals.bloodPressureDia} mmHg
    - O2 Sat: ${patient.vitals.oxygenSaturation}%
    - Temp: ${patient.vitals.temperature} C
    - Resp Rate: ${patient.vitals.respiratoryRate} /min

    Tasks:
    1. Analyze vitals and symptoms for ESI Level (1-5).
    2. "Test Before Touch": Specifically analyze for infectious disease risks (Fever + Cough, Rash, Travel history, etc.). 
       If high risk, set 'infectionRisk' to true and suggest specific isolation/remote protocols in 'infectionProtocol'.
    3. Provide clear reasoning.
    4. Provide a confidence score (0-100) based on the completeness of data and clarity of symptoms.

    IMPORTANT: The content for 'esiReasoning', 'summary', 'recommendedAction', 'specialistRequired', and 'infectionProtocol' MUST BE IN ${language === 'th' ? 'THAI' : 'ENGLISH'}.
    If the input contains Thai, respect the context but ensure the medical output is professional in the requested language.

    Provide the output in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: triageSchema,
        temperature: 0.2, 
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AIAnalysisResult;

  } catch (error) {
    console.error("Triage Analysis Failed:", error);
    // Fallback safe default
    return {
      esiLevel: 3,
      esiDescription: "Analysis Failed - Treat as Urgent",
      esiReasoning: "AI analysis unavailable. Manual triage required.",
      summary: "AI Service unavailable. Manual triage required.",
      recommendedAction: "Perform manual assessment immediately.",
      specialistRequired: "General ER Physician",
      riskFactors: ["AI Analysis Failure"],
      infectionRisk: false,
      infectionProtocol: "Standard Precautions",
      confidenceScore: 0
    };
  }
};

export const getSymptomFollowUp = async (symptoms: string, age: string, gender: string, language: Language = 'en'): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  if (!symptoms || symptoms.length < 3) {
      return language === 'th' ? "กรุณาระบุอาการของคุณให้ละเอียดกว่านี้" : "Please describe your symptoms in more detail first.";
  }

  const prompt = `
    Act as an AI Triage Chatbot (Remote Triage Assistant).
    Patient: ${age} years old, ${gender}.
    Reported Symptoms: "${symptoms}"

    Generate ONE single, critical follow-up question to clarify the severity of the condition (ESI Level) or Infection Risk.
    Focus on ruling out life-threatening emergencies or contagious risks.
    Keep the question conversational but clinical.
    
    IMPORTANT: Generate the question in ${language === 'th' ? 'THAI' : 'ENGLISH'}.

    Output only the question text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    const text = response.text;
    return text ? text.trim() : (language === 'th' ? "ไม่สามารถสร้างคำถามได้" : "Could not generate question.");
  } catch (error) {
    console.error("Symptom checker failed:", error);
    return language === 'th' ? "ไม่สามารถสร้างคำถามติดตามอาการได้ในขณะนี้" : "Could not generate a follow-up question at this time.";
  }
};

export const getPronunciationGuide = async (text: string): Promise<Array<{term: string, pronunciation: string}>> => {
  const model = "gemini-3-flash-preview";
  
  if (!text || text.length < 3) return [];

  const prompt = `
    Identify complex medical terms, medication names, anatomical terms, or difficult words in the text: "${text}".
    Provide a user-friendly phonetic pronunciation guide for each identified term.
    Return result as JSON array.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        term: { type: Type.STRING },
        pronunciation: { type: Type.STRING }
      },
      required: ["term", "pronunciation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      }
    });

    const resultText = response.text;
    if (!resultText) return [];
    
    return JSON.parse(resultText) as Array<{term: string, pronunciation: string}>;
  } catch (error) {
    console.error("Pronunciation guide failed:", error);
    return [];
  }
};