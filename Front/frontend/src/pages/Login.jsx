import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .auth-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    padding: 20px;
  }

  .auth-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 40px;
    width: 100%;
    max-width: 420px;
    border: none;
  }

  .login-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #f0f0f0;
  }

  .logo-container {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .login-header h1 {
    font-size: 24px;
    color: #1a1a1a;
    margin: 0 0 4px 0;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .alert.error {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
  }

  .alert svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .error-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .error-message {
    font-size: 13px;
    line-height: 1.4;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
  }

  .label-text {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .forgot-link {
    font-size: 13px;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .forgot-link:hover {
    color: #764ba2;
    text-decoration: underline;
  }

  .form-group input[type="email"],
  .form-group input[type="password"] {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .form-group input[type="email"]:focus,
  .form-group input[type="password"]:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background-color: #fafbff;
  }

  .form-group input::placeholder {
    color: #999;
  }

  .password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-input-wrapper input {
    padding-right: 40px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    transition: color 0.2s;
    border-radius: 4px;
  }

  .password-toggle:hover {
    color: #667eea;
    background-color: #f5f5f5;
  }

  .field-error {
    display: block;
    font-size: 12px;
    color: #d32f2f;
    margin-top: 4px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 24px 0 28px 0;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }

  .checkbox-group label {
    font-size: 14px;
    color: #1a1a1a;
    cursor: pointer;
    margin: 0;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
  }

  .btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .signup-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
  }

  .signup-section p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 28px 20px;
    }

    .login-header {
      margin-bottom: 24px;
    }

    .btn {
      padding: 11px 14px;
      font-size: 14px;
    }
  }
`

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem('rememberEmail') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('rememberEmail')))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [touched, setTouched] = useState({})

  if (user) {
    const to =
      user.role === 'technician'
        ? '/it/dashboard'
        : user.role === 'hr'
          ? '/hr/dashboard'
        : user.role === 'superadmin'
          ? '/admin/dashboard'
          : '/dashboard'
    return <Navigate to={to} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const dest = await login(email, password)
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      navigate(dest)
    } catch (err) {
      setError(err.response?.data?.detail || 'Connexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <>
      <style>{styles}</style>
      <div className="auth-screen login-modern">
        <div className="login-backdrop" aria-hidden="true">
          <span className="backdrop-grid" />
          <span className="backdrop-orb backdrop-orb-one" />
          <span className="backdrop-orb backdrop-orb-two" />
        </div>
        <form className="auth-card login-modern-card" onSubmit={onSubmit}>
          <div className="login-header">
            <div className="logo-container">
              <img src="/logo.PNG" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
            </div>
            <div>
              <p className="login-kicker">KOKAM PLUS · SUPPORT</p>
              <h1>IT Helpdesk</h1>
              <p className="subtitle">Accédez à votre espace de travail</p>
            </div>
          </div>

          {error && (
            <div className="alert error" role="alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <div className="error-title">Erreur de connexion</div>
                <div className="error-message">{error}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-text">Adresse email</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched('email')}
              placeholder="nom.prenom@entreprise.fr"
              required
              autoComplete="email"
              autoFocus
            />
            {touched.email && email && !isEmailValid && (
              <span className="field-error">Veuillez entrer une adresse email valide</span>
            )}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">
                <span className="label-text">Mot de passe</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Oublié ?</Link>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched('password')}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="checkbox-group">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Mémoriser mon email</label>
          </div>

          <button className="btn primary" disabled={busy} type="submit">
            {busy ? (
              <>
                <span className="spinner" />
                Connexion en cours…
              </>
            ) : (
              <>
                Se connecter
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                  <path d="M6 12L10 8L6 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <div className="signup-section">
            <p>Un accès professionnel pour suivre vos demandes en toute simplicité.</p>
          </div>
        </form>
      </div>
    </>
  )
}