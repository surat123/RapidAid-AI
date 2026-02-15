export enum ViewState {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  PATIENT_FORM = 'PATIENT_FORM',
  DASHBOARD = 'DASHBOARD',
  TRANSPORT = 'TRANSPORT',
  DOCUMENTATION = 'DOCUMENTATION',
  SOS = 'SOS',
  IDS = 'IDS',
  RANSOMWARE = 'RANSOMWARE',
}

export type Language = 'en' | 'th';

export type UserRole = 'STAFF' | 'ADMIN' | 'EMS';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface VitalSigns {
  heartRate: string;
  bloodPressureSys: string;
  bloodPressureDia: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
}

export interface TriageHistoryEvent {
  timestamp: number;
  type: 'CREATION' | 'STATUS_CHANGE' | 'AI_UPDATE' | 'SOS_ALERT';
  details: string;
  actor: 'SYSTEM' | 'STAFF' | 'AI';
  meta?: any;
}

export interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: string;
  symptoms: string;
  medicalHistory: string;
  suggestedSpecialist?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  vitals: VitalSigns;
  timestamp: number;
  status: 'pending' | 'triaged' | 'admitted';
  
  // History Tracking
  history: TriageHistoryEvent[];

  // New fields for Project Concept
  submissionSource: 'mobile_app' | 'wearable' | 'walk_in' | 'sos';
  requestTeleconsult: boolean;
  
  // SOS Fields
  imageUrl?: string;
  location?: { lat: number; lng: number };

  // AI Generated fields
  aiAnalysis?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  esiLevel: number; // 1 (Most Urgent) to 5 (Least Urgent)
  esiDescription: string;
  esiReasoning: string;
  summary: string;
  recommendedAction: string;
  specialistRequired: string;
  riskFactors: string[];
  
  // Test Before Touch / Infection Control
  infectionRisk: boolean;
  infectionProtocol: string;

  // Confidence Score
  confidenceScore: number;
}