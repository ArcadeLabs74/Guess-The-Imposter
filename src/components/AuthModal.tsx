import { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { animateScreenIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

export type AuthModalMode = 'signin' | 'signup' | 'reset';

interface AuthModalProps {
  initialMode?: AuthModalMode;
  onClose: () => void;
  onSuccess?: () => void;
  requiredForOnline?: boolean;
}

export function AuthModal({
  initialMode = 'signin',
  onClose,
  onSuccess,
  requiredForOnline = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateScreenIn(contentRef.current);
  }, [mode]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: AuthModalMode) => {
    soundManager.playClick();
    clearMessages();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode !== 'reset' && !password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      if (mode === 'signup') {
        const { user, error } = await authService.signUp(email.trim(), password, displayName.trim());
        if (error) throw error;

        if (user && !user.identities?.length) {
          setErrorMsg('An account with this email already exists. Try signing in.');
        } else {
          setSuccessMsg('Account created successfully! Check your email if verification is required.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1200);
        }
      } else if (mode === 'signin') {
        const { error } = await authService.signInWithEmail(email.trim(), password);
        if (error) throw error;

        setSuccessMsg('Signed in successfully! Access granted.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      } else if (mode === 'reset') {
        const { error } = await authService.resetPassword(email.trim());
        if (error) throw error;

        setSuccessMsg('Password reset link has been dispatched to your email.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setGoogleLoading(true);
    soundManager.playClick();

    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setErrorMsg(err?.message || 'Failed to initialize Google Sign In.');
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card panel-pad modal"
        ref={contentRef}
        style={{ maxWidth: 460, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>
              <KeyRound size={13} />
              AUTHENTICATION CLEARANCE
            </div>
            <h3 className="modal-title" style={{ fontSize: 24 }}>
              {mode === 'signin' && 'OPERATIVE SIGN IN'}
              {mode === 'signup' && 'CREATE DOSSIER'}
              {mode === 'reset' && 'RECOVER CREDENTIALS'}
            </h3>
          </div>
          <button
            className="device-icon-btn"
            style={{ color: 'var(--ink)', background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {requiredForOnline && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-strong)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--ink)',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={15} color="var(--accent-strong)" />
            <span>Sign in or create an account to access Online Multiplayer rooms.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-soft)',
              border: '1px solid var(--danger)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 12.5,
              color: 'var(--danger)',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--sage-soft)',
              border: '1px solid var(--accent-strong)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 12.5,
              color: 'var(--accent-strong)',
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        {mode !== 'reset' && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '16px 0 12px',
                color: 'var(--text-muted)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>
                Codename / Operative Alias
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: 38, height: 42 }}
                  placeholder="e.g. Ghost, Viper, Cipher"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={24}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: 38, height: 42 }}
                placeholder="agent@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-strong)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onClick={() => handleModeSwitch('reset')}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: 38, height: 42 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: 38, height: 42 }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ height: 46, marginTop: 6 }}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn size={16} /> Sign In to Dossier ↗
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus size={16} /> Create Account ↗
              </>
            ) : (
              <>
                <Mail size={16} /> Send Reset Link ↗
              </>
            )}
          </button>
        </form>

        {/* Modal Switch Footer */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12.5 }}>
          {mode === 'signin' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              New operative?{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-strong)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                onClick={() => handleModeSwitch('signup')}
              >
                Sign up for an account
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-strong)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                onClick={() => handleModeSwitch('signin')}
              >
                Sign in here
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Remembered your password?{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-strong)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                onClick={() => handleModeSwitch('signin')}
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
