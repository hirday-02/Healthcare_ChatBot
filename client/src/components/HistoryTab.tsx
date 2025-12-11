import type { HistoryEntry } from '../types';
import './HistoryTab.css';

interface HistoryTabProps {
  history: HistoryEntry[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onClear: (type?: HistoryEntry['type']) => Promise<void>;
}

const formatTitle = (entry: HistoryEntry): string => {
  switch (entry.type) {
    case 'chat':
      return 'Chat Consultation';
    case 'symptom_check':
      return 'Symptom Analysis';
    case 'diet_plan':
      return 'Diet Plan';
    default:
      return 'Entry';
  }
};

export const HistoryTab = ({
  history,
  isLoading,
  onRefresh,
  onClear
}: HistoryTabProps) => (
  <section className="tab-card history-tab">
    <header className="tab-card__header">
      <div>
        <h2>Consultation History</h2>
        <p>Review previous interactions and generated resources.</p>
      </div>
      <div className="history-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            void onRefresh();
          }}
          disabled={isLoading}
        >
          ⟳ Refresh
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => {
            void onClear();
          }}
          disabled={isLoading || history.length === 0}
        >
          🗑 Clear All
        </button>
      </div>
    </header>

    <div className="history-filters">
      <span>Filter:</span>
      <button
        type="button"
        onClick={() => {
          void onClear('chat');
        }}
        disabled={history.length === 0}
      >
        Clear Chats
      </button>
      <button
        type="button"
        onClick={() => {
          void onClear('symptom_check');
        }}
        disabled={history.length === 0}
      >
        Clear Symptom Checks
      </button>
      <button
        type="button"
        onClick={() => {
          void onClear('diet_plan');
        }}
        disabled={history.length === 0}
      >
        Clear Diet Plans
      </button>
    </div>

    <div className="history-list">
      {isLoading && <p className="loading">Loading history...</p>}
      {!isLoading && history.length === 0 && (
        <p className="placeholder">
          History is empty. Start a chat, run a symptom check, or generate a diet plan to see entries here.
        </p>
      )}
      {!isLoading &&
        history
          .slice()
          .reverse()
          .map((entry) => (
            <article key={entry.id} className={`history-card ${entry.type}`}>
              <header>
                <h3>{formatTitle(entry)}</h3>
                <time>{new Date(entry.timestamp).toLocaleString()}</time>
              </header>
              <div className="history-body">
                {entry.type === 'chat' && (
                  <>
                    <p>
                      <strong>Question:</strong> {(entry as any).user.slice(0, 240)}
                      {(entry as any).user.length > 240 ? '…' : ''}
                    </p>
                    <p>
                      <strong>Response:</strong> {(entry as any).assistant.slice(0, 240)}
                      {(entry as any).assistant.length > 240 ? '…' : ''}
                    </p>
                  </>
                )}
                {entry.type === 'symptom_check' && (
                  <>
                    <p>
                      <strong>Symptoms:</strong> {(entry as any).symptoms}
                    </p>
                    <p>
                      <strong>Duration:</strong> {(entry as any).duration || 'Not specified'}
                    </p>
                    <p>
                      <strong>Severity:</strong> {(entry as any).severity || 'Not specified'}
                    </p>
                  </>
                )}
                {entry.type === 'diet_plan' && (
                  <>
                    <p>
                      <strong>Goal:</strong> {(entry as any).goal}
                    </p>
                    <p>
                      <strong>Diet Type:</strong> {(entry as any).dietType}
                    </p>
                  </>
                )}
              </div>
            </article>
          ))}
    </div>
  </section>
);

