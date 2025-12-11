export interface HealthProfile {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  blood_type: string;
  allergies: string;
  conditions: string;
  medications: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface HistoryEntryBase {
  id: string;
  timestamp: string;
  type: 'chat' | 'symptom_check' | 'diet_plan';
}

export interface ChatHistoryEntry extends HistoryEntryBase {
  type: 'chat';
  user: string;
  assistant: string;
}

export interface SymptomHistoryEntry extends HistoryEntryBase {
  type: 'symptom_check';
  symptoms: string;
  duration: string;
  severity: string;
  analysis: string;
}

export interface DietPlanHistoryEntry extends HistoryEntryBase {
  type: 'diet_plan';
  goal: string;
  dietType: string;
  plan: string;
}

export type HistoryEntry =
  | ChatHistoryEntry
  | SymptomHistoryEntry
  | DietPlanHistoryEntry;

