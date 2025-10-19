import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';
import { ROLE_ICONS } from '../constants';

const Tutorial: React.FC = () => {
    const context = useContext(AppContext);
    const [step, setStep] = useState(0);

    if (!context) return null;
    const { setView, t } = context;

    const tutorialSteps = [
        {
            title: 'Welcome to Find the Thief!',
            icon: '🔍',
            content: 'The goal is simple: The Minister must find and identify the Thief to win the round.',
        },
        {
            title: 'Meet the Key Players',
            icon: '👥',
            content: [
                { role: 'King', desc: 'King_Desc', icon: ROLE_ICONS.King },
                { role: 'Minister', desc: 'Minister_Desc', icon: ROLE_ICONS.Minister },
                { role: 'Soldier', desc: 'Soldier_Desc', icon: ROLE_ICONS.Soldier },
                { role: 'Thief', desc: 'Thief_Desc', icon: ROLE_ICONS.Thief },
            ],
        },
        {
            title: 'A Round of Play',
            icon: '🔄',
            content: 'Round_Desc',
        },
        {
            title: 'Winning & Losing',
            icon: '🏆',
            content: 'Scoring_Desc',
        },
        {
            title: "You're Ready!",
            icon: '🎉',
            content: 'Good_Luck',
        },
    ];

    const currentStep = tutorialSteps[step];

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
            <div className="bg-black/60 p-8 rounded-2xl max-w-2xl w-full space-y-4 border-2 border-[var(--accent-color)]">
                <h1 className="text-4xl font-bold text-stroke text-center">{t('Tutorial')}</h1>
                <div className="bg-black/30 p-6 rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">{currentStep.icon}</div>
                    <h2 className="text-3xl text-stroke mb-4">{t(currentStep.title)}</h2>
                    {Array.isArray(currentStep.content) ? (
                        <div className="space-y-2 text-left">
                            {currentStep.content.map(item => (
                                <p key={item.role} className="text-xl text-stroke">
                                    {item.icon} <strong>{t(item.role)}:</strong> {t(item.desc)}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xl text-stroke whitespace-pre-line">{t(currentStep.content)}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                     <ThemedButton variant="secondary" onClick={handlePrev} disabled={step === 0} className="!w-32">
                        {t('Previous')}
                    </ThemedButton>
                    <div className="text-xl text-stroke">{step + 1} / {tutorialSteps.length}</div>
                    <ThemedButton variant="secondary" onClick={handleNext} disabled={step === tutorialSteps.length - 1} className="!w-32">
                        {t('Next')}
                    </ThemedButton>
                </div>

                <div className="pt-4 text-center">
                    <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Back')}</ThemedButton>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;