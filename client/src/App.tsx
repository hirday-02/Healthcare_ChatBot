import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabButton } from './components/TabButton';
import { ProfileTab } from './components/ProfileTab';
import { ChatTab } from './components/ChatTab';
import { SymptomsTab } from './components/SymptomsTab';
import { DietTab } from './components/DietTab';
import { HistoryTab } from './components/HistoryTab';
import {
  fetchProfile,
  updateProfile,
  sendChatMessage,
  analyzeSymptoms,
  generateDietPlan,
  fetchHistory,
  clearHistory
} from './api/healthcare';
import type {
  ChatMessage,
  HealthProfile,
  HistoryEntry
} from './types';

type TabKey = 'profile' | 'chat' | 'symptoms' | 'diet' | 'history';

const initialAssistantMessage: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hello! I'm your virtual healthcare advisor. Share your health goals or questions, and I'll offer general guidance. For urgent or serious concerns, please contact a licensed professional immediately.",
  timestamp: new Date().toISOString()
};

const generateId = () =>
  (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    initialAssistantMessage
  ]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    void loadProfile();
    void refreshHistory();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const loadProfile = async () => {
    try {
      const { profile: storedProfile } = await fetchProfile();
      if (storedProfile) {
        setProfile(storedProfile);
      }
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Unable to load profile.');
    }
  };

  const refreshHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const { history: entries } = await fetchHistory();
      setHistory(entries);
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Unable to load history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSaveProfile = async (payload: HealthProfile) => {
    try {
      setIsSavingProfile(true);
      await updateProfile(payload);
      setProfile(payload);
      showFeedback('success', 'Profile saved successfully.');
    } catch (error) {
      console.error(error);
      showFeedback('error', (error as Error).message ?? 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendChat = async (message: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsSendingChat(true);

    try {
      const { reply } = await sendChatMessage(message);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      await refreshHistory();
    } catch (error) {
      console.error('[client] Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const fallback: ChatMessage = {
        id: generateId(),
        sender: 'assistant',
        text: `I encountered an issue: ${errorMessage}. Please try again or contact a healthcare professional for urgent issues.`,
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, fallback]);
      showFeedback('error', `Unable to reach the healthcare assistant: ${errorMessage}`);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleAnalyzeSymptoms = async (payload: {
    symptoms: string;
    duration: string;
    severity: string;
  }) => {
    try {
      setIsAnalyzing(true);
      const { analysis } = await analyzeSymptoms(payload);
      await refreshHistory();
      return analysis;
    } catch (error) {
      console.error('[client] Symptoms error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showFeedback('error', `Unable to analyze symptoms: ${errorMessage}`);
      return `The assistant encountered an error: ${errorMessage}. Please retry later or consult a medical professional directly.`;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDiet = async (payload: {
    goal: string;
    dietType: string;
  }) => {
    try {
      setIsGeneratingDiet(true);
      const { plan } = await generateDietPlan(payload);
      await refreshHistory();
      return plan;
    } catch (error) {
      console.error('[client] Diet plan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showFeedback('error', `Unable to generate diet plan: ${errorMessage}`);
      return `The assistant encountered an error: ${errorMessage}. Please retry later or consult a registered dietitian.`;
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const handleClearHistory = async (type?: HistoryEntry['type']) => {
    try {
      await clearHistory(type);
      await refreshHistory();
      showFeedback('success', type ? 'Selected history cleared.' : 'History cleared.');
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Failed to clear history.');
    }
  };

  const tabs = useMemo(
    () => [
      { key: 'profile', label: 'Profile', icon: '👤' },
      { key: 'chat', label: 'Health Chat', icon: '💬' },
      { key: 'symptoms', label: 'Symptom Checker', icon: '🩺' },
      { key: 'diet', label: 'Diet Plan', icon: '🥗' },
      { key: 'history', label: 'History', icon: '📋' }
    ] as const,
    []
  );

  return (
    <div className="app-shell">
      <Header />

      <nav className="tab-bar">
        {tabs.map(({ key, label, icon }) => (
          <TabButton
            key={key}
            icon={icon}
            label={label}
            isActive={activeTab === key}
            onClick={() => setActiveTab(key)}
          />
        ))}
      </nav>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <main className="tab-content">
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            isSaving={isSavingProfile}
            onSave={handleSaveProfile}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab
            messages={chatMessages}
            isSending={isSendingChat}
            onSend={handleSendChat}
          />
        )}
        {activeTab === 'symptoms' && (
          <SymptomsTab
            onAnalyze={handleAnalyzeSymptoms}
            isAnalyzing={isAnalyzing}
          />
        )}
        {activeTab === 'diet' && (
          <DietTab
            hasProfile={Boolean(profile)}
            profile={profile}
            onGenerate={handleGenerateDiet}
            isGenerating={isGeneratingDiet}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            isLoading={isLoadingHistory}
            onRefresh={refreshHistory}
            onClear={handleClearHistory}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
