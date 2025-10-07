import React, { useContext } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { setView, t } = context;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 p-4">
      <h1 className="text-6xl md:text-8xl font-black text-stroke text-center filter drop-shadow-lg mb-8">
        {t('Find the Thief')}
      </h1>

      <ThemedButton onClick={() => setView(View.PLAYER_SETUP)}>
        {t('Play')}
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
