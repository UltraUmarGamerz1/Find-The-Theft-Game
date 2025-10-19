import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const MultiplayerLogin: React.FC = () => {
    const context = useContext(AppContext);
    const [name, setName] = useState(context?.multiplayerName || '');

    if (!context) return null;

    const { setView, setMultiplayerName, t } = context;

    const handleContinue = () => {
        if (name.trim()) {
            setMultiplayerName(name.trim());
            setView(View.MULTIPLAYER_LOBBY);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
            <div className="bg-black/60 p-8 rounded-2xl max-w-lg w-full text-center space-y-4 border-2 border-[var(--accent-color)]">
                <h1 className="text-5xl font-bold text-stroke text-center mb-6">{t('Multiplayer')}</h1>
                <p className="text-xl text-stroke">{t('Enter your username')}</p>
                
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('Username')}
                    className="w-full p-3 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)] text-center text-2xl focus:outline-none focus:ring-2 focus:ring-[var(--glow-color)]"
                    maxLength={15}
                />

                <ThemedButton onClick={handleContinue} disabled={!name.trim()}>
                    {t('Continue')}
                </ThemedButton>
                
                <div className="pt-6 text-center">
                    <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>
                        {t('Back')}
                    </ThemedButton>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerLogin;