import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Common/Button';

const Settings = () => {
    const { user, isAdmin, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);

    // User Management States
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'helper',
    });

    useEffect(() => {
        if (isAdmin && activeTab === 'users') {
            loadUsers();
        }
    }, [isAdmin, activeTab]);

    // Refresh users every 30 seconds for online status
    useEffect(() => {
        if (!isAdmin || activeTab !== 'users') return;
        const interval = setInterval(loadUsers, 30000);
        return () => clearInterval(interval);
    }, [isAdmin, activeTab]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const isUserOnline = (lastSeen) => {
        if (!lastSeen) return false;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(lastSeen) > fiveMinutesAgo;
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Bitte wählen Sie eine Bilddatei aus');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Bild ist zu groß. Maximale Größe: 2MB');
            return;
        }

        setUploadProgress(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const res = await api.post('/users/profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const updatedUser = { ...user, profileImage: res.data.profileImage };
            updateUser(updatedUser);
            alert('Profilbild erfolgreich hochgeladen!');
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('Fehler beim Hochladen des Profilbilds');
        } finally {
            setUploadProgress(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, userFormData);
            } else {
                await api.post('/auth/register', userFormData);
            }
            setShowUserModal(false);
            setEditingUser(null);
            setUserFormData({ username: '', email: '', password: '', role: 'helper' });
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Fehler beim Speichern des Benutzers');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
        try {
            await api.delete(`/users/${userId}`);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Fehler beim Löschen des Benutzers');
        }
    };

    const openEditUserModal = (u) => {
        setEditingUser(u);
        setUserFormData({
            username: u.username,
            email: u.email,
            password: '',
            role: u.role,
        });
        setShowUserModal(true);
    };

    const openNewUserModal = () => {
        setEditingUser(null);
        setUserFormData({ username: '', email: '', password: '', role: 'helper' });
        setShowUserModal(true);
    };

    const getProfileImageUrl = (filename) => {
        if (!filename) return null;
        return `/uploads/profiles/${filename}`;
    };

    const onlineDotStyle = (online) => ({
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: online ? '#22c55e' : '#9ca3af',
        border: '2px solid white',
        boxShadow: online ? '0 0 6px rgba(34, 197, 94, 0.5)' : 'none',
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        transition: 'all 0.3s',
    });

    return (
        <Layout>
            <div className="container fade-in">
                <h1 style={{ marginBottom: '2rem' }}>⚙️ Einstellungen</h1>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '2px solid var(--border)',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'profile' ? 'white' : 'var(--text-primary)',
                            border: 'none',
                            borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            borderRadius: '6px 6px 0 0',
                        }}
                    >
                        👤 Profil
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'users' ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                borderRadius: '6px 6px 0 0',
                            }}
                        >
                            👥 Benutzerverwaltung
                        </button>
                    )}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem' }}>Mein Profil</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                            {user?.profileImage ? (
                                <img
                                    src={getProfileImageUrl(user.profileImage)}
                                    alt="Profilbild"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginBottom: '1rem',
                                        boxShadow: 'var(--shadow-lg)',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem',
                                    color: 'white',
                                    marginBottom: '1rem',
                                    boxShadow: 'var(--shadow-lg)',
                                }}>
                                    {user?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}

                            <h3>{user?.username}</h3>
                            <p className="text-muted">{user?.email}</p>
                            <p className="text-muted">Rolle: {user?.role === 'admin' ? 'Administrator' : 'Helfer'}</p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageUpload}
                                    style={{ display: 'none' }}
                                    id="profile-upload"
                                    disabled={uploadProgress}
                                />
                                <label
                                    htmlFor="profile-upload"
                                    style={{
                                        display: 'inline-block',
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        cursor: uploadProgress ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: uploadProgress ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {uploadProgress ? '⏳ Wird hochgeladen...' : '📷 Profilbild ändern'}
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab (Admin only) */}
                {activeTab === 'users' && isAdmin && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Benutzerverwaltung</h2>
                            <Button variant="primary" onClick={openNewUserModal}>
                                + Neuer Benutzer
                            </Button>
                        </div>

                        {loading && users.length === 0 ? (
                            <div className="spinner"></div>
                        ) : (
                            <div className="grid grid-2">
                                {users.map((u) => {
                                    const online = isUserOnline(u.lastSeen);
                                    return (
                                        <div key={u.id} className="card">
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                {/* Avatar with online dot */}
                                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                                    {u.profileImage ? (
                                                        <img
                                                            src={getProfileImageUrl(u.profileImage)}
                                                            alt={u.username}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.5rem',
                                                            color: 'white',
                                                        }}>
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {/* Online status dot */}
                                                    <div style={onlineDotStyle(online)} title={online ? 'Online' : 'Offline'} />
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <h3 style={{ margin: 0 }}>{u.username}</h3>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            color: online ? '#22c55e' : '#9ca3af',
                                                            fontWeight: '500',
                                                        }}>
                                                            {online ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted" style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>{u.email}</p>
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            background: u.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                                            color: u.role === 'admin' ? '#1e40af' : '#6b7280',
                                                        }}
                                                    >
                                                        {u.role === 'admin' ? 'Admin' : 'Helfer'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-gap">
                                                <Button variant="outline" size="small" onClick={() => openEditUserModal(u)}>
                                                    Bearbeiten
                                                </Button>
                                                {u.id !== user.id && (
                                                    <Button variant="danger" size="small" onClick={() => handleDeleteUser(u.id)}>
                                                        Löschen
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* User Modal */}
                {showUserModal && (
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
                            padding: '1rem',
                        }}
                        onClick={() => setShowUserModal(false)}
                    >
                        <div
                            className="card"
                            style={{ width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>
                                {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
                            </h2>
                            <form onSubmit={handleUserSubmit}>
                                <div className="form-group">
                                    <label>Benutzername *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={userFormData.username}
                                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>E-Mail *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Passwort {editingUser && '(leer lassen, um beizubehalten)'}</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rolle *</label>
                                    <select
                                        className="form-control"
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                        required
                                    >
                                        <option value="helper">Helfer</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="flex-gap">
                                    <Button type="submit" variant="primary">
                                        Speichern
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>
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

export default Settings;
