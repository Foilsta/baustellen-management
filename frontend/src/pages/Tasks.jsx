import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import Button from '../components/Common/Button';

const Tasks = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        status: 'open',
    });

    useEffect(() => {
        loadTasks();
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data.tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask.id}`, formData);
            } else {
                await api.post('/tasks', formData);
            }
            setShowModal(false);
            setEditingTask(null);
            setFormData({ title: '', description: '', dueDate: '', status: 'open' });
            loadTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Fehler beim Speichern der Aufgabe');
        }
    };

    const handleTakeTask = async (taskId) => {
        try {
            await api.post(`/tasks/${taskId}/take`);
            loadTasks();
        } catch (error) {
            console.error('Error taking task:', error);
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            await api.post(`/tasks/${taskId}/complete`);
            loadTasks();
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const handleAssignTask = async (taskId, userId) => {
        try {
            await api.post(`/tasks/${taskId}/assign`, { assignedToId: parseInt(userId) });
            loadTasks();
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate || '',
            status: task.status,
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingTask(null);
        setFormData({ title: '', description: '', dueDate: '', status: 'open' });
        setShowModal(true);
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
                        <h1>📋 Aufgaben</h1>
                        <p className="text-muted">Verwalten Sie alle Aufgaben auf Ihrer Baustelle</p>
                    </div>
                    <Button variant="primary" onClick={openNewModal}>
                        + Neue Aufgabe
                    </Button>
                </div>

                <div className="grid grid-2">
                    {tasks.map((task) => (
                        <div key={task.id} className="card">
                            <div className="flex-between mb-2">
                                <h3>{task.title}</h3>
                                <StatusBadge status={task.status} type="task" />
                            </div>

                            {task.description && (
                                <p className="text-muted mb-2">{task.description}</p>
                            )}

                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                                {task.dueDate && (
                                    <p>📅 Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}</p>
                                )}
                                {task.createdBy && (
                                    <p>👤 Erstellt von: {task.createdBy.username}</p>
                                )}
                                {task.assignedTo && (
                                    <p>✅ Zugewiesen an: {task.assignedTo.username}</p>
                                )}
                                {task.completedBy && (
                                    <p>✔️ Erledigt von: {task.completedBy.username}</p>
                                )}
                            </div>

                            <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                                {task.status !== 'completed' && (
                                    <>
                                        {task.status === 'open' && (
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => handleTakeTask(task.id)}
                                            >
                                                Übernehmen
                                            </Button>
                                        )}
                                        {task.status === 'in_progress' && task.assignedToId === user.id && (
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => handleCompleteTask(task.id)}
                                            >
                                                Erledigen
                                            </Button>
                                        )}
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => openEditModal(task)}
                                >
                                    Bearbeiten
                                </Button>
                                {isAdmin && (
                                    <>
                                        <select
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '8px',
                                                border: '2px solid var(--border)',
                                                fontSize: '0.875rem',
                                            }}
                                            value={task.assignedToId || ''}
                                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                                        >
                                            <option value="">Zuweisen...</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.username}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleDeleteTask(task.id)}
                                        >
                                            Löschen
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {tasks.length === 0 && (
                    <div className="card text-center">
                        <p className="text-muted">Noch keine Aufgaben vorhanden</p>
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
                            <h2 className="mb-3">
                                {editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Titel *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Beschreibung</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fälligkeitsdatum</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                {editingTask && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="open">Offen</option>
                                            <option value="in_progress">In Bearbeitung</option>
                                            <option value="completed">Erledigt</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex-gap">
                                    <Button type="submit" variant="primary">
                                        Speichern
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

export default Tasks;
