import React, { useContext } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Language, Theme } from '../types';
import ToggleSwitch from '../components/ToggleSwitch';
import ThemedButton from '../components/Button';

const SettingsScreen: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { settings, updateSettings, setView, t } = context;

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ language: e.target.value as Language });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
      <div className="bg-black/60 p-8 rounded-2xl max-w-lg w-full space-y-4 border-2 border-[var(--accent-color)]">
        <h1 className="text-5xl font-bold text-stroke text-center mb-6">{t('Settings')}</h1>

        <div className="space-y-2">
          <p className="text-2xl text-stroke">{t('Theme')}</p>
          <div className="grid grid-cols-2 gap-4">
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('wooden')} className={settings.theme === 'wooden' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Wooden')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('modern')} className={settings.theme === 'modern' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Modern Futuristic')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('minecraft')} className={settings.theme === 'minecraft' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Minecraft')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('gta5')} className={settings.theme === 'gta5' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('GTA 5')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('classic')} className={settings.theme === 'classic' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Classic')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('paper')} className={settings.theme === 'paper' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Paper')}
            </ThemedButton>
            <ThemedButton variant="secondary" onClick={() => handleThemeChange('real_life')} className={settings.theme === 'real_life' ? 'border-4 border-[var(--glow-color)]' : ''}>
              {t('Real Life')}
            </ThemedButton>
          </div>
        </div>

        <ToggleSwitch label={t('Sound')} checked={settings.sound} onChange={(checked) => updateSettings({ sound: checked })} />
        <ToggleSwitch label={t('Vibration')} checked={settings.vibration} onChange={(checked) => updateSettings({ vibration: checked })} />
        <ToggleSwitch label={t('Music')} checked={settings.music} onChange={(checked) => updateSettings({ music: checked })} />
        
        <div>
          <label className="text-2xl text-stroke block mb-2">Language</label>
          <select value={settings.language} onChange={handleLanguageChange} className="w-full p-2 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)]">
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="hi">Hindi</option>
            <option value="ro">Roman Urdu</option>
          </select>
        </div>

        <div className="pt-6 text-center">
            <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>
                {t('Back')}
            </ThemedButton>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;