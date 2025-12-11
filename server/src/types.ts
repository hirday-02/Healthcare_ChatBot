export type Gender = 'Male' | 'Female' | 'Other' | '';

export interface HealthProfile {
  name: string;
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  blood_type: string;
  allergies: string;
  conditions: string;
  medications: string;
}

export type HistoryEntryType = 'chat' | 'symptom_check' | 'diet_plan';

interface BaseHistoryEntry {
  id: string;
  timestamp: string;
  type: HistoryEntryType;
}

export interface ChatHistoryEntry extends BaseHistoryEntry {
  type: 'chat';
  user: string;
  assistant: string;
}

export interface SymptomHistoryEntry extends BaseHistoryEntry {
  type: 'symptom_check';
  symptoms: string;
  duration: string;
  severity: string;
  analysis: string;
}

export interface DietPlanHistoryEntry extends BaseHistoryEntry {
  type: 'diet_plan';
  goal: string;
  dietType: string;
  plan: string;
}

export type HistoryEntry =
  | ChatHistoryEntry
  | SymptomHistoryEntry
  | DietPlanHistoryEntry;

