import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navLinks = [
        { path: '/', label: '📊 Dashboard' },
        { path: '/tasks', label: '📋 Aufgaben' },
        { path: '/materials', label: '📦 Materialien' },
        { path: '/settings', label: '⚙️ Einstellungen' },
    ];

    return (
        <>
            <style>{`
                .header {
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    color: white;
                    padding: 0 1.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    position: sticky;
                    top: 0;
                    z-index: 999;
                }
                .header-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 60px;
                }
                .header-logo {
                    color: white;
                    text-decoration: none;
                    font-size: 1.35rem;
                    font-weight: bold;
                    white-space: nowrap;
                }
                .header-nav-desktop {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-left: 2rem;
                }
                .header-nav-desktop a {
                    color: rgba(255,255,255,0.8);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .header-nav-desktop a:hover {
                    color: white;
                    background: rgba(255,255,255,0.1);
                }
                .header-nav-desktop a.active {
                    color: white;
                    background: rgba(255,255,255,0.15);
                }
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .header-user {
                    font-size: 0.85rem;
                    opacity: 0.9;
                    white-space: nowrap;
                }
                .header-btn {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    border-radius: 8px;
                    padding: 0.4rem 0.6rem;
                    color: white;
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header-btn:hover {
                    background: rgba(255,255,255,0.25);
                }
                .header-logout {
                    background: rgba(239,68,68,0.8);
                    border: none;
                    border-radius: 8px;
                    padding: 0.4rem 0.75rem;
                    color: white;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .header-logout:hover {
                    background: rgba(239,68,68,1);
                }

                /* Hamburger */
                .hamburger {
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                    width: 28px;
                    height: 28px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    z-index: 1001;
                }
                .hamburger span {
                    display: block;
                    width: 24px;
                    height: 2.5px;
                    background: white;
                    border-radius: 3px;
                    transition: all 0.3s ease;
                    transform-origin: center;
                }
                .hamburger.open span:nth-child(1) {
                    transform: translateY(7.5px) rotate(45deg);
                }
                .hamburger.open span:nth-child(2) {
                    opacity: 0;
                }
                .hamburger.open span:nth-child(3) {
                    transform: translateY(-7.5px) rotate(-45deg);
                }

                /* Mobile Menu Overlay */
                .mobile-overlay {
                    display: none;
                    position: fixed;
                    top: 60px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 998;
                    animation: fadeIn 0.2s ease;
                }
                .mobile-overlay.open {
                    display: block;
                }

                /* Mobile Menu */
                .mobile-menu {
                    display: none;
                    position: fixed;
                    top: 60px;
                    right: -280px;
                    width: 280px;
                    bottom: 0;
                    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
                    z-index: 999;
                    padding: 1.5rem;
                    transition: right 0.3s ease;
                    overflow-y: auto;
                    box-shadow: -4px 0 20px rgba(0,0,0,0.3);
                }
                .mobile-menu.open {
                    right: 0;
                }
                .mobile-menu .mobile-user {
                    padding: 1rem;
                    background: rgba(255,255,255,0.08);
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                .mobile-menu .mobile-user-name {
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }
                .mobile-menu .mobile-user-role {
                    font-size: 0.8rem;
                    opacity: 0.7;
                }
                .mobile-menu a {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: rgba(255,255,255,0.8);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 1.05rem;
                    padding: 0.9rem 1rem;
                    border-radius: 10px;
                    transition: all 0.2s;
                    margin-bottom: 0.25rem;
                }
                .mobile-menu a:hover,
                .mobile-menu a.active {
                    color: white;
                    background: rgba(255,255,255,0.12);
                }
                .mobile-menu .mobile-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 1rem 0;
                }
                .mobile-menu .mobile-actions {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }
                .mobile-menu .mobile-actions button {
                    flex: 1;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .mobile-theme-btn {
                    background: rgba(255,255,255,0.12);
                    color: white;
                }
                .mobile-logout-btn {
                    background: rgba(239,68,68,0.8);
                    color: white;
                }

                @media (max-width: 768px) {
                    .header-nav-desktop {
                        display: none;
                    }
                    .header-user {
                        display: none;
                    }
                    .header-right .header-btn,
                    .header-right .header-logout {
                        display: none;
                    }
                    .hamburger {
                        display: flex;
                    }
                    .mobile-menu {
                        display: block;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            <header className="header">
                <div className="header-inner">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/" className="header-logo">
                            🏗️ Hoffmann
                        </Link>

                        <nav className="header-nav-desktop">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={isActive(link.path) ? 'active' : ''}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="header-right">
                        <span className="header-user">
                            {user?.username} ({user?.role === 'admin' ? 'Admin' : 'Helfer'})
                        </span>

                        <button
                            className="header-btn"
                            onClick={toggleTheme}
                            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        <button className="header-logout" onClick={handleLogout}>
                            Abmelden
                        </button>

                        {/* Hamburger Button (mobile only) */}
                        <button
                            className={`hamburger ${menuOpen ? 'open' : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menü"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(false)}
            />

            {/* Mobile Slide-out Menu */}
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <div className="mobile-user">
                    <div className="mobile-user-name">
                        {user?.username}
                    </div>
                    <div className="mobile-user-role">
                        {user?.role === 'admin' ? 'Administrator' : 'Helfer'}
                    </div>
                </div>

                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={isActive(link.path) ? 'active' : ''}
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}

                <div className="mobile-divider" />

                <div className="mobile-actions">
                    <button
                        className="mobile-theme-btn"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <button
                        className="mobile-logout-btn"
                        onClick={handleLogout}
                    >
                        🚪 Abmelden
                    </button>
                </div>
            </div>
        </>
    );
};

export default Header;
