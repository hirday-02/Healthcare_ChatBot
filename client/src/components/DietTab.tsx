import { useState, useEffect } from 'react';
import './DietTab.css';
import type { HealthProfile } from '../types';

const GOALS = [
  'Weight Loss',
  'Weight Gain',
  'Maintain Weight',
  'Muscle Building'
] as const;

const ALLERGIES = [
  'None',
  'Nuts',
  'Dairy',
  'Gluten',
  'Shellfish',
  'Eggs',
  'Soy',
  'Fish'
] as const;

const FOOD_CATEGORIES = {
  Fruits: [
    'Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry', 'Grapes',
    'Mango', 'Pineapple', 'Watermelon', 'Kiwi', 'Peach', 'Pear'
  ],
  Vegetables: [
    'Broccoli', 'Spinach', 'Carrot', 'Tomato', 'Cucumber', 'Bell Pepper',
    'Cauliflower', 'Kale', 'Zucchini', 'Cabbage', 'Lettuce', 'Onion'
  ],
  Protein: [
    'Chicken Breast', 'Tuna', 'Eggs', 'Chickpeas', 'Paneer', 'Turkey',
    'Salmon', 'Soybeans', 'Lentils', 'Tofu', 'Tempeh', 'Edamame'
  ],
  Grains: [
    'Brown Rice', 'Quinoa', 'Oats', 'Whole Wheat Bread', 'Barley',
    'Buckwheat', 'Millet', 'Whole Wheat Pasta', 'Bulgur', 'Farro'
  ]
} as const;

interface DietTabProps {
  hasProfile: boolean;
  profile?: HealthProfile | null;
  onGenerate: (payload: { goal: string; dietType: string }) => Promise<string>;
  isGenerating: boolean;
}

export const DietTab = ({
  hasProfile,
  profile,
  onGenerate,
  isGenerating
}: DietTabProps) => {
  const [goal, setGoal] = useState<typeof GOALS[number]>('Maintain Weight');
  const [allergies, setAllergies] = useState<typeof ALLERGIES[number]>('None');
  const [dietType] = useState<string>('Balanced');
  const [plan, setPlan] = useState('');
  
  // Profile state (can be edited in this tab)
  // Note: Profile stores height in cm, but UI shows in meters
  const [age, setAge] = useState(profile?.age || '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState(
    profile?.height ? (parseFloat(profile.height) / 100).toString() : ''
  );
  const [weight, setWeight] = useState(profile?.weight || '');
  const [bmi, setBmi] = useState<string | null>(null);

  // Sync profile data when prop changes
  useEffect(() => {
    if (profile) {
      setAge(profile.age || '');
      setGender(profile.gender || 'Male');
      // Convert cm to meters for display
      setHeight(profile.height ? (parseFloat(profile.height) / 100).toString() : '');
      setWeight(profile.weight || '');
    }
  }, [profile]);
  
  // Food selection state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Protein']));
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());

  // Calculate BMI
  const calculateBMI = () => {
    const heightMeters = parseFloat(height);
    const weightKg = parseFloat(weight);
    
    if (!heightMeters || !weightKg || heightMeters <= 0 || weightKg <= 0) {
      setBmi(null);
      return;
    }
    
    const bmiValue = weightKg / (heightMeters * heightMeters);
    let category = 'Normal';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue >= 25 && bmiValue < 30) category = 'Overweight';
    else if (bmiValue >= 30) category = 'Obese';
    
    setBmi(`${bmiValue.toFixed(1)} (${category})`);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleFood = (food: string) => {
    setSelectedFoods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(food)) {
        newSet.delete(food);
      } else {
        newSet.add(food);
      }
      return newSet;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await onGenerate({ goal, dietType });
    setPlan(result);
  };

  return (
    <div className="diet-tab-container">
      <header className="diet-header">
        <h1 className="diet-title">Virtual Health Advisor</h1>
        <p className="diet-subtitle">Your daily nutrition planner</p>
      </header>

      <div className="diet-content">
        <div className="diet-left-column">
          {/* Your Profile Section */}
          <section className="diet-section profile-section">
            <h2 className="section-title">Your Profile</h2>
            <div className="profile-inputs">
              <div className="input-group">
                <label>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter age"
                  className="diet-input"
                />
              </div>
              <div className="input-group">
                <label>Height (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 1.75"
                  className="diet-input"
                />
              </div>
              <div className="input-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  className="diet-input"
                />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="diet-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="bmi-section">
                <button
                  type="button"
                  onClick={calculateBMI}
                  className="bmi-button"
                >
                  Calculate BMI
                </button>
                <span className="bmi-display">BMI: {bmi || '-'}</span>
              </div>
            </div>
          </section>

          {/* Goals & Allergies Section */}
          <section className="diet-section goals-section">
            <h2 className="section-title">Goals & Allergies</h2>
            <div className="goals-inputs">
              <div className="input-group">
                <label>What is your primary goal?</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as typeof GOALS[number])}
                  className="diet-select"
                >
                  {GOALS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Do you have any allergies?</label>
                <select
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value as typeof ALLERGIES[number])}
                  className="diet-select"
                >
                  {ALLERGIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Select Your Foods Section */}
        <div className="diet-right-column">
          <section className="diet-section foods-section">
            <h2 className="section-title">Select Your Foods</h2>
            <div className="food-categories">
              {Object.entries(FOOD_CATEGORIES).map(([category, foods]) => {
                const isExpanded = expandedCategories.has(category);
                return (
                  <div
                    key={category}
                    className={`food-category ${isExpanded ? 'expanded' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="category-header"
                    >
                      <span>{category}</span>
                      <span className="category-icon">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                    {isExpanded && (
                      <div className="food-list">
                        {foods.map((food) => (
                          <label
                            key={food}
                            className={`food-item ${selectedFoods.has(food) ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFoods.has(food)}
                              onChange={() => toggleFood(food)}
                            />
                            <span>{food}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Generate Plan Button */}
      <div className="diet-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isGenerating}
          className="generate-button"
        >
          {isGenerating ? 'Creating Plan...' : 'GENERATE MY PLAN ✨'}
        </button>
      </div>

      {/* Plan Preview */}
      {plan && (
        <section className="diet-plan">
          <h3>Your Personalized Plan</h3>
          <div className="diet-plan__content">
            <pre>{plan}</pre>
          </div>
        </section>
      )}
    </div>
  );
};
