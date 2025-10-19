import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Player } from '../types';
import ThemedButton from '../components/Button';
import Modal from '../components/Modal';
import { ROLE_ICONS } from '../constants';

const RoleAssignment: React.FC = () => {
  const context = useContext(AppContext);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  if (!context) return null;
  const { gameState, setView, playSound, t, isAdminMode } = context;
  const { players } = gameState;

  const allRevealed = revealed.size === players.length;

  useEffect(() => {
    const aiPlayers = players.filter(p => p.isAI);
    if (aiPlayers.length > 0) {
      let delay = 500; // Initial delay
      aiPlayers.forEach(aiPlayer => {
        if (!revealed.has(aiPlayer.id)) {
          setTimeout(() => {
            setRevealed(prev => new Set(prev).add(aiPlayer.id));
            playSound('click'); // Play a subtle sound for AI reveal
          }, delay);
          delay += 750; // Stagger the reveals
        }
      });
    }
  }, [players, playSound, revealed]);

  useEffect(() => {
    if (allRevealed && players.length > 0) {
      const timer = setTimeout(() => {
        setView(View.GAMEPLAY);
      }, 2500); // 2.5 second delay before starting

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [allRevealed, players.length, setView]);

  const handleReveal = (player: Player) => {
    playSound('reveal');
    setActivePlayer(player);
  };

  const handleCloseModal = () => {
    if (activePlayer) {
      setRevealed(prev => new Set(prev).add(activePlayer.id));
    }
    setActivePlayer(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
      <h1 className="text-5xl font-bold text-stroke text-center mb-8">{t('Reveal Roles')}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {players.map(player => (
          <div key={player.id} className="text-center flex flex-col items-center">
            <p className="text-2xl text-stroke mb-2">{player.name}</p>
            <ThemedButton 
              variant="secondary"
              onClick={() => handleReveal(player)}
              disabled={player.isAI || revealed.has(player.id)}
              className={`w-28 h-40 text-6xl flex items-center justify-center transition-colors ${revealed.has(player.id) ? 'opacity-50 !bg-gray-600' : ''} ${player.isAI ? 'cursor-not-allowed' : ''}`}
              aria-label={`${t('Select Paper')} for ${player.name}`}
            >
              {isAdminMode && player.role ? ROLE_ICONS[player.role] : (revealed.has(player.id) ? '✔' : (player.isAI ? '🤖' : '🃏'))}
            </ThemedButton>
          </div>
        ))}
      </div>
      
      {allRevealed && (
        <div className="mt-12 text-center animate-pulse">
            <p className="text-3xl text-stroke mb-4">{t('All roles revealed!')}</p>
             <p className="text-2xl text-stroke">{`${t('Start Round')} ${gameState.currentRound}...`}</p>
        </div>
      )}

      <Modal isOpen={!!activePlayer} onClose={handleCloseModal} title={`${activePlayer?.name}, ${t('Your Role is...')}`}>
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-8xl">{activePlayer?.role && ROLE_ICONS[activePlayer.role]}</p>
            <p className="text-5xl font-black text-stroke text-[var(--accent-color)]">{activePlayer?.role ? t(activePlayer.role) : '???'}</p>
          </div>
          <ThemedButton variant="secondary" onClick={handleCloseModal}>{t('OK')}</ThemedButton>
        </div>
      </Modal>
    </div>
  );
};

export default RoleAssignment;