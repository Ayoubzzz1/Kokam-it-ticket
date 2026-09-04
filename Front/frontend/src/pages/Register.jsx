import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

export default function Register() {
  return (
    <div className="auth-screen register-screen">
      <div className="auth-card register-card">
        <div className="register-header">
          <BrandLogo variant="auth" />
          <div>
            <h1>Inscription désactivée</h1>
            <p className="subtitle">KOKAM PLUS</p>
          </div>
        </div>

        <div className="alert error" role="alert">
          <div>
            <div className="error-title">Création de compte non disponible</div>
            <div className="error-message">
              L'inscription publique est désactivée. Un administrateur doit créer votre compte.
            </div>
          </div>
        </div>

        <p className="signin-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-screen.register-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
        }

        .auth-card.register-card {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 40px;
          gap: 24px;
          display: flex;
          flex-direction: column;
        }

        .register-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 8px;
        }

        .register-header > :first-child {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
        }

        .register-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .register-header .subtitle {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }

        .alert.error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .error-title {
          font-weight: 600;
          margin-bottom: 2px;
        }

        .error-message {
          font-size: 13px;
          color: currentColor;
        }

        .signin-link {
          text-align: center;
          margin: 0;
          padding-top: 16px;
          font-size: 14px;
          color: #64748b;
        }

        .signin-link a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .signin-link a:hover {
          color: #2563eb;
        }

        @media (max-width: 640px) {
          .auth-card.register-card {
            padding: 28px 20px;
          }

          .register-header {
            gap: 12px;
          }

          .register-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}