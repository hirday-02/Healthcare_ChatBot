import { useState } from 'react';
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

  return (
    <section className="tab-card symptoms-tab">
      <header className="tab-card__header">
        <h2>Symptom Checker</h2>
        <p>Describe your symptoms for a preliminary AI assessment.</p>
      </header>
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
          {!isAnalyzing && result && <pre>{result}</pre>}
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

