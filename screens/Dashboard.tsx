import React, { useContext } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { setView, t, coins } = context;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start space-y-8 p-4 pt-16 overflow-y-auto">
      <div className="fixed top-4 right-4 bg-black/70 p-2 px-4 rounded-full flex items-center gap-2 border-2 border-[var(--accent-color)] shadow-lg z-50">
        <span className="text-2xl" role="img" aria-label="coin">🪙</span>
        <span className="text-2xl font-bold text-stroke">{coins}</span>
      </div>

      <h1 className="text-6xl md:text-8xl font-black text-stroke text-center filter drop-shadow-lg mb-8">
        {t('Find the Thief')}
      </h1>

      <ThemedButton onClick={() => setView(View.PLAYER_SETUP)}>
        {t('Local Play')}
      </ThemedButton>

      <ThemedButton onClick={() => setView(View.MULTIPLAYER_LOGIN)}>
        {t('Multiplayer')}
      </ThemedButton>
      
      <ThemedButton onClick={() => setView(View.TUTORIAL)}>
        {t('Tutorial')}
      </ThemedButton>

      <ThemedButton onClick={() => setView(View.SETTINGS)}>
        {t('Settings')}
      </ThemedButton>

      <ThemedButton onClick={() => setView(View.SUGGESTIONS)}>
        {t('Update Suggests')}
      </ThemedButton>
      
      <ThemedButton variant="float" onClick={() => setView(View.BUG_REPORT)}>
        🐞
      </ThemedButton>
    </div>
  );
};

export default Dashboard;