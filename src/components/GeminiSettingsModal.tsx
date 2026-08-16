import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { soundManager } from '../services/soundService';
import type { WordData } from '../types/game';

interface GeminiSettingsModalProps {
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  onClose: () => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({
  currentApiKey,
  onSaveApiKey,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [testResult, setTestResult] = useState<WordData | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    soundManager.playClick();
    onSaveApiKey(apiKey.trim());
    GeminiService.setApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    soundManager.playClick();
    try {
      const res = await GeminiService.generateWordAndClue('random', undefined, apiKey.trim());
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '32px',
          position: 'relative',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-bright)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            ✨
          </div>
          <div>
            <h2 style={{ fontSize: '22px', color: '#fff', margin: 0 }}>Gemini AI Configuration</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Procedural Word Generation & Smart AI Bots
            </p>
          </div>
        </div>

        {/* Info box */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          textAlign: 'left',
        }}>
          <strong style={{ color: 'var(--cyan-accent)' }}>Optional Live API Key:</strong> You can provide a Google Gemini API Key for infinite dynamic words, custom category generation, and AI bot clues. If left empty, the game uses its built-in database of 50+ rich topics!
        </div>

        {/* Input */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
          }}>
            Google Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingLeft: '40px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
          </div>
        </div>

        {/* Test Generator button */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '13px' }}
          >
            {isTesting ? <RefreshCw size={15} className="animate-float" /> : <Sparkles size={15} />}
            <span>{isTesting ? 'Generating...' : 'Test AI Generator'}</span>
          </button>
        </div>

        {/* Test Result preview */}
        {testResult && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'left',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--emerald-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              ✓ Generator Response:
            </div>
            <div style={{ fontSize: '14px', color: '#fff', marginTop: '4px' }}>
              Category: <strong>{testResult.category}</strong> | Word: <strong>{testResult.secretWord}</strong>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
              Imposter Clue: "{testResult.imposterHint}"
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          {savedSuccess ? <CheckCircle size={18} /> : <CheckCircle size={18} />}
          <span>{savedSuccess ? 'Saved & Applied!' : 'Save AI Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
