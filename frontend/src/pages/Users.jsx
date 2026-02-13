import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import Button from '../components/Common/Button';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'helper',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', role: 'helper' });
            loadUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.error || 'Fehler beim Erstellen des Benutzers');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
        try {
            await api.delete(`/users/${userId}`);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.error || 'Fehler beim Löschen des Benutzers');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container fade-in">
                <div className="flex-between mb-3">
                    <div>
                        <h1>👥 Benutzerverwaltung</h1>
                        <p className="text-muted">Verwalten Sie Benutzer und deren Rollen</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        + Neuer Benutzer
                    </Button>
                </div>

                <div className="grid grid-2">
                    {users.map((user) => (
                        <div key={user.id} className="card">
                            <div className="flex-between mb-2">
                                <h3>{user.username}</h3>
                                <span
                                    className="status-badge"
                                    style={{
                                        background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                        color: user.role === 'admin' ? '#1e40af' : '#6b7280',
                                    }}
                                >
                                    {user.role === 'admin' ? 'Administrator' : 'Helfer'}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <p className="text-muted">
                                    📧 {user.email}
                                </p>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    Erstellt: {new Date(user.createdAt).toLocaleDateString('de-DE')}
                                </p>
                            </div>

                            <Button
                                variant="danger"
                                size="small"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                Löschen
                            </Button>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="card text-center">
                        <p className="text-muted">Keine Benutzer vorhanden</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="card"
                            style={{ width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="mb-3">Neuer Benutzer</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Benutzername *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        minLength={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>E-Mail *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Passwort *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rolle</label>
                                    <select
                                        className="form-control"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="helper">Helfer</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="flex-gap">
                                    <Button type="submit" variant="primary">
                                        Erstellen
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Abbrechen
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Users;
