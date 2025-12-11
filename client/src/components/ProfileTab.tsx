import { useEffect, useMemo, useState } from 'react';
import type { HealthProfile } from '../types';
import './ProfileTab.css';

interface ProfileTabProps {
  profile: HealthProfile | null;
  isSaving: boolean;
  onSave: (profile: HealthProfile) => Promise<void>;
  onProfileChange?: (profile: HealthProfile) => void;
}

const defaultProfile: HealthProfile = {
  name: '',
  age: '',
  gender: 'Male',
  height: '',
  weight: '',
  blood_type: '',
  allergies: '',
  conditions: '',
  medications: ''
};

export const ProfileTab = ({
  profile,
  isSaving,
  onSave,
  onProfileChange
}: ProfileTabProps) => {
  const [form, setForm] = useState<HealthProfile>(defaultProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmiResult, setBmiResult] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({ ...defaultProfile, ...profile });
    }
  }, [profile]);

  useEffect(() => {
    onProfileChange?.(form);
  }, [form, onProfileChange]);

  const handleChange = (field: keyof HealthProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (form.age && Number.isNaN(Number(form.age))) {
      newErrors.age = 'Age must be a number';
    }
    if (form.height && Number.isNaN(Number(form.height))) {
      newErrors.height = 'Height must be a number';
    }
    if (form.weight && Number.isNaN(Number(form.weight))) {
      newErrors.weight = 'Weight must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    await onSave(form);
  };

  const bmiInfo = useMemo(() => {
    const heightMeters = Number(form.height) / 100;
    const weightKg = Number(form.weight);
    if (!heightMeters || !weightKg) {
      return null;
    }
    const bmi = weightKg / (heightMeters * heightMeters);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    return { bmi: bmi.toFixed(2), category };
  }, [form.height, form.weight]);

  const handleBmiClick = () => {
    if (!bmiInfo) {
      setBmiResult('Enter a valid height (cm) and weight (kg) to calculate BMI.');
      return;
    }
    setBmiResult(`BMI: ${bmiInfo.bmi} (${bmiInfo.category})`);
  };

  return (
    <section className="tab-card">
      <header className="tab-card__header">
        <h2>Personal Health Profile</h2>
        <p>Keep your primary health details up to date for better recommendations.</p>
      </header>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-grid">
          <label>
            <span>Full Name</span>
            <input value={form.name} onChange={handleChange('name')} />
          </label>
          <label>
            <span>Age</span>
            <input value={form.age} onChange={handleChange('age')} />
            {errors.age && <small className="error">{errors.age}</small>}
          </label>
          <label>
            <span>Gender</span>
            <select value={form.gender} onChange={handleChange('gender')}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            <span>Height (cm)</span>
            <input value={form.height} onChange={handleChange('height')} />
            {errors.height && <small className="error">{errors.height}</small>}
          </label>
          <label>
            <span>Weight (kg)</span>
            <input value={form.weight} onChange={handleChange('weight')} />
            {errors.weight && <small className="error">{errors.weight}</small>}
          </label>
          <label>
            <span>Blood Type</span>
            <select value={form.blood_type} onChange={handleChange('blood_type')}>
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </label>
          <label className="wide">
            <span>Allergies</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                value={form.allergies} 
                onChange={handleChange('allergies')} 
                placeholder="Type 'None' if no allergies"
              />
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, allergies: 'None' }))}
                style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                Set None
              </button>
            </div>
          </label>
          <label className="wide">
            <span>Chronic Conditions</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                value={form.conditions} 
                onChange={handleChange('conditions')} 
                placeholder="Type 'None' if no chronic conditions"
              />
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, conditions: 'None' }))}
                style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                Set None
              </button>
            </div>
          </label>
          <label className="wide">
            <span>Current Medications</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                value={form.medications} 
                onChange={handleChange('medications')} 
                placeholder="Type 'None' if no medications"
              />
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, medications: 'None' }))}
                style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                Set None
              </button>
            </div>
          </label>
        </div>

        <div className="profile-actions">
          <button type="button" className="secondary" onClick={handleBmiClick}>
            Calculate BMI
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>

        {bmiResult && <p className="bmi-result">{bmiResult}</p>}
      </form>
    </section>
  );
};

