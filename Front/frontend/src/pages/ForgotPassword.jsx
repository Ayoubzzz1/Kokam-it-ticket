import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

export default function ForgotPassword() {
  return (
    <main className="auth-screen login-screen">
      <section className="auth-card login-card support-card">
        <BrandLogo variant="auth" />
        <div>
          <p className="eyebrow">Accès au compte</p>
          <h1>Mot de passe oublié ?</h1>
          <p className="support-copy">
            Les comptes sont créés et réinitialisés par l&apos;administration.
            Contactez le service informatique pour retrouver votre accès.
          </p>
        </div>
        <Link to="/login" className="btn primary btn-submit">Retour à la connexion</Link>
      </section>
    </main>
  )
}