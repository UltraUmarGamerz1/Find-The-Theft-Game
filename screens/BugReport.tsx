import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const BugReportScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [bugText, setBugText] = useState('');
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [fileName, setFileName] = useState('');

  if (!context) return null;
  const { setView, bugReports, addBugReport, removeBugReport, t, setIsAdminMode, isAdminMode } = context;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const base64 = await fileToBase64(file);
      setScreenshot(base64);
    }
  };

  const handleSend = () => {
    const trimmedText = bugText.trim();
    if (trimmedText === '22112012L@@#') {
      setIsAdminMode(true);
      alert('Admin Mode Activated!');
      setBugText('');
      setScreenshot(undefined);
      setFileName('');
      setView(View.DASHBOARD);
      return;
    }

    if (trimmedText) {
      addBugReport(trimmedText, screenshot);
      setBugText('');
      setScreenshot(undefined);
      setFileName('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this bug report?')) {
        removeBugReport(id);
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
      <div className="bg-black/60 p-8 rounded-2xl max-w-2xl w-full space-y-4 border-2 border-[var(--accent-color)]">
        <h1 className="text-5xl font-bold text-stroke text-center mb-6">{t('Bug Reports')}</h1>
        
        <div className="space-y-4 mb-6">
          <textarea
            value={bugText}
            onChange={(e) => setBugText(e.target.value)}
            placeholder={t('Describe the bug...')}
            className="w-full h-24 p-3 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--glow-color)]"
          />
          <label className="block w-full text-center p-3 rounded cursor-pointer bg-[var(--secondary-color)] text-[var(--bg-color)] hover:bg-opacity-80">
            {fileName || t('Upload Screenshot (Optional)')}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <div className="text-center">
            <ThemedButton variant="secondary" onClick={handleSend}>{t('Send')}</ThemedButton>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-4 bg-[var(--primary-color)] rounded-lg border-2 border-[var(--secondary-color)]">
          {bugReports.length > 0 ? (
            <ul className="space-y-3 text-left">
              {bugReports.map((r) => (
                <li key={r.id} className="p-3 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded flex justify-between items-start">
                  <div className="w-full pr-2">
                    <p className="break-words">{r.text}</p>
                    {r.screenshot && (
                      <img src={r.screenshot} alt="Screenshot" className="max-w-xs max-h-32 my-2 rounded" />
                    )}
                    <p className="text-xs opacity-70">{new Date(r.timestamp).toLocaleString()}</p>
                  </div>
                   {isAdminMode && (
                    <button
                        onClick={() => handleDelete(r.id)}
                        className="ml-2 text-red-700 font-bold text-2xl hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Delete bug report"
                    >
                        &times;
                    </button>
                    )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">{t('No bug reports yet.')}</p>
          )}
        </div>
        
        <div className="pt-6 text-center">
          <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Back')}</ThemedButton>
        </div>
      </div>
    </div>
  );
};

export default BugReportScreen;