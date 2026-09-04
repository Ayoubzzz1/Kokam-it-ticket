export default function BrandLogo({ variant = 'auth' }) {
  return (
    <div className={`brand-logo brand-logo--${variant}`}>
      <img src="/logo.PNG" alt="Kokam plus" />
    </div>
  )
}
