import { HealthProfile } from '../types';

const formatProfileContext = (profile?: HealthProfile | null): string => {
  if (!profile) {
    return '';
  }

  const formatted = Object.entries(profile)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `Patient Profile:\n${formatted}\n\n`;
};

export const buildChatPrompt = (
  message: string,
  profile?: HealthProfile | null
): string => {
  const profileContext = formatProfileContext(profile);
  return `You are a compassionate and knowledgeable virtual healthcare advisor. Your role is to provide helpful, empathetic health guidance while emphasizing the importance of professional medical care for serious conditions.

${profileContext}Patient's Question: ${message}

Please provide a helpful, empathetic response that:
1. Directly addresses the patient's concern
2. Offers practical, general wellness guidance
3. Highlights any red flags or warning signs that require immediate medical attention
4. Encourages consulting with a licensed healthcare professional for serious or persistent issues
5. Uses clear, easy-to-understand language
6. Maintains a supportive and caring tone

IMPORTANT: This is for informational purposes only and does not replace professional medical advice. Always remind them to consult a healthcare professional for serious concerns.`;
};

export const buildSymptomPrompt = (
  symptoms: string,
  duration: string,
  severity: string,
  profile?: HealthProfile | null
): string => {
  const profileContext = formatProfileContext(profile);
  return `You are a healthcare advisor analyzing patient symptoms. Provide a comprehensive, structured assessment while emphasizing that this is not a diagnosis.

${profileContext}SYMPTOM DETAILS:
- Symptoms Reported: ${symptoms}
- Duration: ${duration || 'Not specified'}
- Severity (1-10 scale): ${severity || 'Not specified'}

Please provide a detailed analysis with the following structure:

## **Possible Conditions** (Educational Purposes Only)
[List potential conditions these symptoms might indicate, but emphasize these are POSSIBILITIES, not diagnoses. Mention 2-4 most likely scenarios based on common causes.]

## **Self-Care & Home Monitoring**
[Provide practical, safe self-care recommendations. Include:
- Rest and hydration advice
- Over-the-counter options (if appropriate)
- Monitoring what to watch for
- Home remedies that are safe to try]

## **Warning Signs - Seek Immediate Medical Care**
[List specific red flags that require immediate medical attention, such as:
- High fever above 101.3°F (38.5°C)
- Difficulty breathing
- Severe pain
- Confusion or loss of consciousness
- Any other urgent symptoms]

## **Recommended Next Steps**
[Suggest what type of healthcare provider to consult (e.g., primary care physician, urgent care, emergency room) and when to seek care.]

## **Important Disclaimer**
⚠️ This assessment is for informational purposes only and does not constitute a medical diagnosis. An in-person consultation with a licensed healthcare professional is required for proper diagnosis and treatment. If symptoms worsen or you have concerns, seek immediate medical attention.

Format your response clearly with the headings above and use bullet points for easy reading.`;
};

export const buildDietPrompt = (
  profile: HealthProfile,
  goal: string,
  dietType: string
): string => {
  const profileContext = formatProfileContext(profile);
  const hasAllergies = profile.allergies && profile.allergies.toLowerCase() !== 'none' && profile.allergies.trim() !== '';
  const hasConditions = profile.conditions && profile.conditions.toLowerCase() !== 'none' && profile.conditions.trim() !== '';
  
  return `You are a nutrition advisor creating a personalized 7-day meal plan. Design a comprehensive, practical, and healthy meal plan based on the following information.

${profileContext}MEAL PLAN REQUIREMENTS:
- Primary Goal: ${goal}
- Diet Type Preference: ${dietType}
${hasAllergies ? `- IMPORTANT: Allergies to avoid: ${profile.allergies}` : ''}
${hasConditions ? `- Health Considerations: ${profile.conditions}` : ''}

Please create a detailed 7-day meal plan with the following structure:

## **Day-by-Day Meal Plan**

For EACH of the 7 days, provide:
- **Breakfast**: Specific meal with portion sizes
- **Lunch**: Specific meal with portion sizes  
- **Dinner**: Specific meal with portion sizes
- **Snacks**: 1-2 healthy snack options
- **Daily Calorie Total**: Estimated total calories for the day
- **Daily Macronutrients**: Total protein, carbs, and fats in grams

## **Weekly Shopping List**

Organize by categories:
- Fresh Produce (fruits, vegetables)
- Proteins (meat, fish, poultry, plant-based)
- Grains & Carbs
- Dairy & Alternatives
- Pantry Staples (spices, oils, etc.)
- Beverages

List specific items with quantities needed for the full week.

## **Meal Prep Tips**

Provide practical tips for:
- Batch preparation ideas
- Storage recommendations
- Quick preparation strategies
- Time-saving techniques

## **Nutritional Guidelines**

Brief summary of:
- Average daily calorie target
- Macronutrient distribution goals
- Key nutrients to focus on

## **Important Notes & Disclaimer**

⚠️ This meal plan is for informational and educational purposes only. It should be reviewed with a registered dietitian or physician before following, especially if you have:
- Medical conditions
- Food allergies or intolerances
- Special dietary requirements
- Are taking medications that may interact with certain foods

Format the response with clear sections, use headings, and make it easy to follow. Be specific with meal suggestions, portion sizes, and preparation methods.`;
};

