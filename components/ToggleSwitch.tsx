import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between w-full cursor-pointer my-2">
      <span className="text-2xl text-stroke">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-16 h-8 rounded-full ${checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--secondary-color)]'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-8' : ''}`}></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
