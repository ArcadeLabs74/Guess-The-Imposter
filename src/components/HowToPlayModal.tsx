import { X } from 'lucide-react';
import { animateScreenIn } from '../lib/animations';
import { useEffect, useRef } from 'react';
import { soundManager } from '../services/soundService';

interface HowToPlayModalProps {
  onClose: () => void;
}

const RULES = [
  {
    title: 'DEAL CLASSIFIED ROLES',
    text: 'Pass the device around the room. Every crewmate views the secret coordinate word — except the undercover imposter, who receives an intercepted clue hint.',
  },
  {
    title: 'TRANSMIT SUBTLE CLUES',
    text: `Taking turns in order, each operative delivers a short phrase hinting at the secret word. Too obvious? The imposter deduces the word. Too vague? You'll raise suspicion among the crew.`,
  },
  {
    title: 'EMERGENCY VOTE',
    text: 'After all clue passes, operatives cast secret ballots on the device. The suspect with the most votes is ejected.',
  },
  {
    title: 'MISSION OUTCOME',
    text: 'The crew wins if the real imposter is identified and ejected. The imposter wins by evading detection or forcing a tie.',
  },
];

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateScreenIn(contentRef.current);
  }, []);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card panel-pad modal" ref={contentRef}>
        <div className="modal-header">
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>OPERATIVE PROTOCOL</div>
            <h3 className="modal-title">GAME MANUAL</h3>
          </div>
          <button
            className="device-icon-btn"
            style={{ color: 'var(--ink)', background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Close rules"
          >
            <X size={18} />
          </button>
        </div>

        {RULES.map((rule, i) => (
          <div className="rule-step" key={rule.title} data-anim>
            <span className="rule-num">0{i + 1}</span>
            <div>
              <h4>{rule.title}</h4>
              <p>{rule.text}</p>
            </div>
          </div>
        ))}

        <button
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: 12 }}
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
        >
          ACKNOWLEDGE & CLOSE ↗
        </button>
      </div>
    </div>
  );
}
