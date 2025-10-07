import React, { useContext } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ isOpen, onClose }) => {
  const context = useContext(AppContext);
  if (!context || !isOpen) return null;

  const { setView, t } = context;

  const handleExit = () => {
    setView(View.DASHBOARD);
  };

  const handleSettings = () => {
    setView(View.SETTINGS);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-6xl font-bold text-stroke mb-4">{t('Game Paused')}</h1>
        <ThemedButton onClick={onClose}>{t('Resume')}</ThemedButton>
        <ThemedButton onClick={handleSettings}>{t('Settings')}</ThemedButton>
        <ThemedButton onClick={handleExit}>{t('Exit')}</ThemedButton>
      </div>
    </div>
  );
};

export default PauseMenu;
