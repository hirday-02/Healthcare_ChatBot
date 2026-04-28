import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
import { FormattedText } from './FormattedText';
import './ChatTab.css';

interface ChatTabProps {
  messages: ChatMessage[];
  isSending: boolean;
  onSend: (message: string) => Promise<void>;
}

export const ChatTab = ({ messages, isSending, onSend }: ChatTabProps) => {
  const [draft, setDraft] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const message = draft.trim();
    setDraft('');
    await onSend(message);
  };

  const isDangerous = (text: string) => {
    return /(medical emergency|go to an emergency room|nearest hospital|call an ambulance|life-threatening condition|requires urgent medical intervention|critical condition)/i.test(text);
  };

  const containsDanger = messages.some(m => m.sender === 'assistant' && isDangerous(m.text));

  return (
    <section className="tab-card chat-tab">
      <header className="tab-card__header">
        <h2>Chat with Health Advisor</h2>
        <p>Ask health questions and receive AI-generated guidance.</p>
      </header>

      {containsDanger && (
        <div className="medical-alert">
          <strong>⚠️ URGENT MEDICAL ALERT:</strong> A high-severity condition may be indicated. Please do not rely solely on online advice. Contact a doctor immediately or call for an ambulance (India: 108, 112, or 102).
        </div>
      )}

      <div className="chat-window" ref={containerRef}>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`chat-bubble ${message.sender}`}
          >
            <header>
              <span>{message.sender === 'user' ? 'You' : 'Assistant'}</span>
              <time>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </header>
            <FormattedText text={message.text} />
          </article>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <textarea
          placeholder="Describe your question or concern..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
        />
        <button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
};

