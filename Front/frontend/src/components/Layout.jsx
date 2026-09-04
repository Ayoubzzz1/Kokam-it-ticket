import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = {
  user: [
    { to: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/absence', label: 'Absence', icon: 'calendar' },
    { to: '/leave-request', label: 'Demande de congé', icon: 'plus' },
    { to: '/advance-request', label: "Demande d'avance", icon: 'wallet' },
    { to: '/general-request', label: 'Demandes', icon: 'folder' },
    { to: '/my-requests', label: 'Mes demandes', icon: 'tickets' },
    { to: '/tickets', label: 'Historique', icon: 'history' },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/profile', label: 'Profil', icon: 'user' },
  ],
  technician: [
    { to: '/it/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/it/tickets', label: 'Tickets', icon: 'tickets' },
    { to: '/it/history', label: 'Historique', icon: 'history' },
    { to: '/leave-request', label: 'Demande de congé', icon: 'plus' },
    { to: '/advance-request', label: "Demande d'avance", icon: 'wallet' },
    { to: '/general-request', label: 'Demandes', icon: 'folder' },
    { to: '/my-requests', label: 'Mes demandes', icon: 'tickets' },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/profile', label: 'Profil', icon: 'user' },
  ],
  hr: [
    { to: '/hr/dashboard', label: 'Demandes RH', icon: 'dashboard' },
    { to: '/hr/attendance', label: 'Absences', icon: 'calendar' },
    { to: '/absence', label: 'Mon absence', icon: 'calendar' },
    { to: '/leave-request', label: 'Demande de congé', icon: 'plus' },
    { to: '/advance-request', label: "Demande d'avance", icon: 'wallet' },
    { to: '/general-request', label: 'Demandes', icon: 'folder' },
    { to: '/my-requests', label: 'Mes demandes', icon: 'tickets' },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/profile', label: 'Profil', icon: 'user' },
  ],
  superadmin: [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { to: '/admin/users', label: 'Utilisateurs', icon: 'users' },
    { to: '/admin/technicians', label: 'Techniciens', icon: 'wrench' },
    { to: '/admin/departments', label: 'Services', icon: 'folder' },
    { to: '/admin/categories', label: 'Catégories', icon: 'tag' },
    { to: '/admin/tickets', label: 'Tickets', icon: 'tickets' },
    { to: '/admin/requests', label: 'Demandes RH', icon: 'folder' },
    { to: '/admin/reports', label: 'Rapports', icon: 'chart' },
    { to: '/admin/settings', label: 'Paramètres', icon: 'settings' },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
    { to: '/profile', label: 'Profil', icon: 'user' },
  ],
}

const SPACE = {
  user: 'Espace employé',
  technician: 'Espace IT',
  hr: 'Espace RH',
  superadmin: 'Administration',
}

const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  tickets: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  history: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  wrench: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2.414-2.6l-5.804-15.162a2 2 0 0 0-3.764 0L2.414 16.4A2 2 0 0 1 1 18.973V21a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"></path>
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <circle cx="8" cy="8" r="1.5"></circle>
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h.5M7 19h8"></path>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24"></path>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path>
    </svg>
  ),
}

function NavIcon({ name }) {
  return ICONS[name] || ICONS.dashboard
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const overlayRef = useRef(null)

  const items = NAV[user?.role] || NAV.user
  const space = SPACE[user?.role] || SPACE.user

  function onLogout() {
    logout()
    navigate('/login')
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      closeSidebar()
    }
  }

  // Handle keyboard escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      if (sidebarOpen) {
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
      } else {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
      }
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [sidebarOpen])

  // Close sidebar on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        closeSidebar()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`app-shell role-${user?.role || 'user'}`}>
      {/* Overlay */}
      <button
        ref={overlayRef}
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        type="button"
        aria-label="Fermer le menu"
        onClick={handleOverlayClick}
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      {/* Sidebar */}
      <aside
        id="main-navigation"
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        aria-label="Navigation principale"
      >
        <div className="sidebar-header">
          <div className="brand">
            <img src="/logo.PNG" alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            <div>
              <p className="brand-label">{space}</p>
            </div>
          </div>
          <button
            className="sidebar-close"
            type="button"
            onClick={closeSidebar}
            aria-label="Fermer le menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to.split('/').length <= 3}
              onClick={closeSidebar}
            >
              <span className="nav-icon">
                <NavIcon name={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" type="button" onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"></path>
              <polyline points="16 7 20 11 16 15"></polyline>
              <line x1="20" y1="11" x2="9" y2="11"></line>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-container">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            aria-controls="main-navigation"
            aria-expanded={sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="topbar-content">
            <div className="topbar-greeting">
              <h1>Bonjour, {user?.first_name || user?.full_name || 'utilisateur'} 👋</h1>
              <p>Bienvenue dans {space.toLowerCase()}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="user-menu-wrapper">
              <button
                className="user-chip"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  {(user?.first_name?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.full_name || 'Utilisateur'}</span>
                  <span className="user-role">{space}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className={`chevron ${userMenuOpen ? 'open' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {(user?.first_name?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="dropdown-name">{user?.full_name || 'Utilisateur'}</p>
                      <p className="dropdown-email">{user?.email || '—'}</p>
                      <p className="dropdown-role">{space}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <NavLink
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mon profil
                  </NavLink>
                  <button className="dropdown-item logout-item" onClick={onLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"></path>
                      <polyline points="16 7 20 11 16 15"></polyline>
                      <line x1="20" y1="11" x2="9" y2="11"></line>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}