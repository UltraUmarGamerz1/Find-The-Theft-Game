import React, { useContext } from 'react';
import { AppContext } from '../App';
import { SOUNDS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'float';
  sound?: keyof typeof SOUNDS;
}

const ThemedButton: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', sound = 'click', ...props }) => {
  const context = useContext(AppContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context?.playSound(sound);
    context?.vibrate();
    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = 'text-stroke text-2xl font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none';
  
  const woodenClasses = 'shadow-lg border-2 border-yellow-800';
  const modernClasses = 'border-2 border-[var(--accent-color)]';

  const variantClasses = {
      primary: `w-64 md:w-80 h-20 bg-[var(--primary-color)] hover:bg-[var(--accent-color)]`,
      secondary: `w-auto h-auto text-xl bg-[var(--secondary-color)] hover:bg-[var(--primary-color)]`,
      float: 'fixed bottom-5 right-5 w-20 h-20 rounded-full text-4xl flex items-center justify-center bg-[var(--primary-color)] hover:bg-[var(--accent-color)]'
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${context?.settings.theme === 'wooden' ? woodenClasses : modernClasses} ${variantClasses[variant]} ${className} btn-glow`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemedButton;