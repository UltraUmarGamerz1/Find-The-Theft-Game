import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-cover bg-center border-4 border-[var(--accent-color)] rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto text-center relative"
        style={document.documentElement.getAttribute('data-theme') === 'wooden' ? { backgroundColor: 'var(--bg-color)'} : { backgroundColor: 'var(--bg-color)' }}
      >
        {title && <h2 className="text-3xl font-bold mb-4 text-stroke">{title}</h2>}
        {onClose && (
          <button onClick={onClose} className="absolute top-2 right-2 text-3xl text-stroke hover:text-[var(--accent-color)] transition">&times;</button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
