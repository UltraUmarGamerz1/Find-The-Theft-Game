import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';
import Modal from '../components/Modal';
import { ADMIN_PASSWORD } from '../constants';

const SuggestionsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [suggestionText, setSuggestionText] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');

  if (!context) return null;
  const { setView, suggestions, addSuggestion, t } = context;

  const handleSend = () => {
    if (suggestionText.trim()) {
      addSuggestion(suggestionText.trim());
      setSuggestionText('');
    }
  };

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setShowSuggestions(true);
      setShowAdminLogin(false);
      setError('');
      setPassword('');
    } else {
      setError(t('You are not admin, can’t see suggests.'));
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="bg-black/60 p-8 rounded-2xl max-w-2xl w-full space-y-4 border-2 border-[var(--accent-color)]">
        <h1 className="text-5xl font-bold text-stroke text-center mb-6">{t('Update Suggests')}</h1>
        
        <textarea
          value={suggestionText}
          onChange={(e) => setSuggestionText(e.target.value)}
          placeholder={t('Write your suggestion here...')}
          className="w-full h-32 p-3 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--glow-color)]"
        />
        <div className="flex justify-center space-x-4">
          <ThemedButton variant="secondary" onClick={handleSend}>{t('Send')}</ThemedButton>
          <ThemedButton variant="secondary" onClick={() => setShowAdminLogin(true)}>{t('View Suggestions')}</ThemedButton>
        </div>

        {showSuggestions && (
          <div className="mt-6 max-h-64 overflow-y-auto p-4 bg-[var(--primary-color)] rounded-lg border-2 border-[var(--secondary-color)]">
            <h2 className="text-2xl text-stroke mb-2">{t('Suggestions')}</h2>
            {suggestions.length > 0 ? (
              <ul className="space-y-2 text-left">
                {suggestions.map((s) => (
                  <li key={s.id} className="p-2 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded">
                    <p>{s.text}</p>
                    <p className="text-xs opacity-70">{new Date(s.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('No suggestions yet.')}</p>
            )}
          </div>
        )}
        
        <div className="pt-6 text-center">
          <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Back')}</ThemedButton>
        </div>
      </div>

      <Modal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} title={t('Enter Admin Password')}>
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)]"
          />
          {error && <p className="text-red-400">{error}</p>}
          <ThemedButton variant="secondary" onClick={handleAdminLogin}>Login</ThemedButton>
        </div>
      </Modal>
    </div>
  );
};

export default SuggestionsScreen;
