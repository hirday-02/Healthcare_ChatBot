import { useState } from 'react';
import { FormattedText } from './FormattedText';
import './SymptomsTab.css';

interface SymptomsTabProps {
  onAnalyze: (payload: {
    symptoms: string;
    duration: string;
    severity: string;
  }) => Promise<string>;
  isAnalyzing: boolean;
}

export const SymptomsTab = ({
  onAnalyze,
  isAnalyzing
}: SymptomsTabProps) => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!symptoms.trim()) return;
    const analysis = await onAnalyze({
      symptoms: symptoms.trim(),
      duration,
      severity
    });
    setResult(analysis);
  };

  const isDangerous = (text: string) => {
    return /(medical emergency|go to an emergency room|nearest hospital|call an ambulance|life-threatening condition|requires urgent medical intervention|critical condition)/i.test(text);
  };

  const isHighSeverity = parseInt(severity, 10) >= 8 || isDangerous(result);

  return (
    <section className="tab-card symptoms-tab">
      <header className="tab-card__header">
        <h2>Symptom Checker</h2>
        <p>Describe your symptoms for a preliminary AI assessment.</p>
      </header>

      {isHighSeverity && result && (
        <div className="medical-alert">
          <strong>⚠️ URGENT MEDICAL ALERT:</strong> This appears to be a high-severity condition. Please do not rely solely on online advice. Contact a doctor immediately or call for an ambulance (India: 108, 112, or 102).
        </div>
      )}

      <form onSubmit={handleSubmit} className="symptoms-form">
        <label>
          <span>Current Symptoms</span>
          <textarea
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="List each symptom, including onset, frequency, and intensity."
            rows={6}
            required
          />
        </label>

        <div className="symptoms-grid">
          <label>
            <span>Duration</span>
            <input
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="e.g., 2 days"
            />
          </label>
          <label>
            <span>Severity (1-10)</span>
            <input
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              placeholder="e.g., 6"
            />
          </label>
        </div>

        <button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Symptoms'}
        </button>
      </form>

      <section className="symptoms-result">
        <h3>Assessment Preview</h3>
        <div className="symptoms-result__content">
          {isAnalyzing && <p className="loading">Analyzing symptoms...</p>}
          {!isAnalyzing && result && <FormattedText text={result} />}
          {!isAnalyzing && !result && (
            <p className="placeholder">
              Results will appear here. This tool does not replace a medical professional.
            </p>
          )}
        </div>
      </section>
    </section>
  );
};

