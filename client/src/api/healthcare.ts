import { apiRequest } from './client';
import type { HealthProfile, HistoryEntry } from '../types';

export const fetchProfile = () =>
  apiRequest<{ profile: HealthProfile | null }>('/profile');

export const updateProfile = (profile: HealthProfile) =>
  apiRequest<void>('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  });

export const sendChatMessage = (message: string) =>
  apiRequest<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });

export const analyzeSymptoms = (
  payload: { symptoms: string; duration: string; severity: string }
) =>
  apiRequest<{ analysis: string }>('/symptoms', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const generateDietPlan = (payload: {
  goal: string;
  dietType: string;
}) =>
  apiRequest<{ plan: string }>('/diet-plan', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const fetchHistory = () =>
  apiRequest<{ history: HistoryEntry[] }>('/history');

export const clearHistory = (type?: 'chat' | 'symptom_check' | 'diet_plan') =>
  apiRequest<void>('/history', {
    method: 'DELETE',
    query: type ? { type } : undefined
  });

export const fetchCommonDiseases = (age: string) =>
  apiRequest<{ analysis: string }>('/profile/common-diseases', {
    method: 'GET',
    query: { age }
  });

