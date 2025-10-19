import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const SuggestionsScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [suggestionText, setSuggestionText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!context) return null;
  const { setView, suggestions, addSuggestion, removeSuggestion, t, isAdminMode } = context;

  const handleSend = () => {
    if (suggestionText.trim()) {
      addSuggestion(suggestionText.trim());
      setSuggestionText('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this suggestion?')) {
        removeSuggestion(id);
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
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
          <ThemedButton variant="secondary" onClick={() => setShowSuggestions(prev => !prev)}>{t('View Suggestions')}</ThemedButton>
        </div>

        {showSuggestions && (
          <div className="mt-6 max-h-64 overflow-y-auto p-4 bg-[var(--primary-color)] rounded-lg border-2 border-[var(--secondary-color)]">
            <h2 className="text-2xl text-stroke mb-2">{t('Suggestions')}</h2>
            {isAdminMode ? (
              suggestions.length > 0 ? (
                <ul className="space-y-2 text-left">
                  {suggestions.map((s) => (
                    <li key={s.id} className="p-2 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded flex justify-between items-start">
                      <div>
                        <p className="break-words w-full pr-2">{s.text}</p>
                        <p className="text-xs opacity-70">{new Date(s.timestamp).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="ml-2 text-red-700 font-bold text-2xl hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Delete suggestion"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t('No suggestions yet.')}</p>
              )
            ) : (
                <p>{t('You are not admin, can’t see suggests.')}</p>
            )}
          </div>
        )}
        
        <div className="pt-6 text-center">
          <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Back')}</ThemedButton>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsScreen;