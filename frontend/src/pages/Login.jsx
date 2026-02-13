import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Common/Button';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(usernameOrEmail, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login fehlgeschlagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-3">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏗️</h1>
                    <h2>Baustellen-Management</h2>
                    <p className="text-muted">Bitte melden Sie sich an</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Benutzername oder E-Mail</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="admin oder admin@baustelle.local"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Passwort</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Anmeldung läuft...' : 'Anmelden'}
                    </Button>
                </form>

                <div className="mt-3 text-center">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Test-Zugang: <strong>admin</strong> / <strong>admin123</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
