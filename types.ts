
export interface User {
  id: string;
  name: string;
  email: string;
  language?: string;
}

export interface OrganBalance {
  liver: string;
  kidney: string;
  digestion: string;
  heart: string;
}

export interface CategoryResult {
  detected: boolean;
  likelihood: number; // 0-100
  markers: string[];
  description: string;
}

export interface DetectedCondition {
  name: string;
  likelihood: number;
  evidence: string;
  severity: 'low' | 'moderate' | 'high';
}

export interface AnalysisResults {
  redness: number;
  cracks: number;
  moisture: number;
  color: string;
  texture: string;
  
  temperament: {
    archetype: string;
    description: string;
    traits: string[];
  };

  detectedConditions: DetectedCondition[];
  
  // Specific Illness Categories (Legacy/Internal)
  viralCommon: CategoryResult;
  chronicSerious: CategoryResult;
  organHealth: OrganBalance;
  mentalState: CategoryResult;
  everydayStuff: CategoryResult;

  guidance: {
    hydration: string;
    nutrition: string;
    lifestyle: string;
    hygiene: string;
    recoverySteps: string[];
    medicalUrgency: 'low' | 'medium' | 'high';
  };
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  image: string;
  results: AnalysisResults;
  summary: string;
}

export type View = 'auth' | 'dashboard' | 'scanner' | 'history' | 'profile' | 'settings' | 'result';
