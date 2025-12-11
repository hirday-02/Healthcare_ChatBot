import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
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

  return (
    <section className="tab-card chat-tab">
      <header className="tab-card__header">
        <h2>Chat with Health Advisor</h2>
        <p>Ask health questions and receive AI-generated guidance.</p>
      </header>

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
            <p>{message.text}</p>
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

