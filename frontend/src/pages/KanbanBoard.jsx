import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import Button from '../components/Common/Button';
import UserAvatar from '../components/Common/UserAvatar';

const KanbanBoard = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedTask, setDraggedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        assignedToId: '',
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

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        try {
            await api.put(`/tasks/${draggedTask.id}`, { status: newStatus });
            loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Fehler beim Verschieben der Aufgabe');
        } finally {
            setDraggedTask(null);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setFormData({ title: '', description: '', dueDate: '', assignedToId: '' });
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            assignedToId: task.assignedToId || '',
        });
        setShowModal(true);
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
            loadTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Fehler beim Speichern der Aufgabe');
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
            return;
        }

        try {
            await api.delete(`/tasks/${taskId}`);
            setShowModal(false);
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Fehler beim Löschen der Aufgabe');
        }
    };

    const columns = [
        { id: 'open', title: '📋 Offen', status: 'open', color: '#dbeafe', darkColor: '#1e40af' },
        { id: 'in_progress', title: '⚙️ In Bearbeitung', status: 'in_progress', color: '#fef3c7', darkColor: '#92400e' },
        { id: 'completed', title: '✅ Fertig', status: 'completed', color: '#d1fae5', darkColor: '#065f46' },
    ];

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
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1>📋 Aufgaben</h1>
                        <p className="text-muted">Ziehen Sie Aufgaben zwischen den Spalten</p>
                    </div>
                    <Button variant="primary" onClick={openCreateModal}>
                        + Neue Aufgabe
                    </Button>
                </div>

                {/* Kanban Board */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    minHeight: '60vh',
                }}>
                    {columns.map(column => {
                        const columnTasks = getTasksByStatus(column.status);

                        return (
                            <div
                                key={column.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.status)}
                                className="card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '400px',
                                }}
                            >
                                {/* Column Header */}
                                <div style={{
                                    background: column.color,
                                    color: column.darkColor,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'inherit' }}>{column.title}</h3>
                                    <span style={{ fontSize: '0.875rem', opacity: 0.8, color: 'inherit' }}>
                                        {columnTasks.length} {columnTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
                                    </span>
                                </div>

                                {/* Tasks */}
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                }}>
                                    {columnTasks.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '2rem 1rem',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.875rem',
                                        }}>
                                            Keine Aufgaben
                                        </div>
                                    ) : (
                                        columnTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task)}
                                                onClick={() => openEditModal(task)}
                                                style={{
                                                    background: draggedTask?.id === task.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                                    border: '2px solid var(--border)',
                                                    borderRadius: '8px',
                                                    padding: '1rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: draggedTask?.id === task.id ? 0.5 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (draggedTask?.id !== task.id) {
                                                        e.currentTarget.style.borderColor = '#3b82f6';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--border)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <h4 style={{
                                                    marginBottom: '0.5rem',
                                                    fontSize: '1rem',
                                                    color: 'var(--text-primary)',
                                                }}>
                                                    {task.title}
                                                </h4>

                                                {task.description && (
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        color: 'var(--text-secondary)',
                                                        marginBottom: '0.75rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.25rem',
                                                }}>
                                                    {task.dueDate && (
                                                        <div>📅 {new Date(task.dueDate).toLocaleDateString('de-DE')}</div>
                                                    )}
                                                    {task.createdBy && (
                                                        <div>👤 {task.createdBy.username}</div>
                                                    )}
                                                    {task.assignedTo && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <UserAvatar user={task.assignedTo} />
                                                            <span>{task.assignedTo.username}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Floating Action Button for Mobile */}
                <button
                    onClick={openCreateModal}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
                    }}
                    className="fab-mobile"
                >
                    +
                </button>

                {/* Task Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1rem',
                    }} onClick={() => setShowModal(false)}>
                        <div className="card" style={{
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginBottom: '1.5rem' }}>
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
                                        rows="4"
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

                                {isAdmin && (
                                    <div className="form-group">
                                        <label>Zuweisen an</label>
                                        <select
                                            className="form-control"
                                            value={formData.assignedToId}
                                            onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                                        >
                                            <option value="">Nicht zugewiesen</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                                    <Button type="submit" variant="primary">
                                        {editingTask ? 'Speichern' : 'Erstellen'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                        Abbrechen
                                    </Button>
                                    {editingTask && isAdmin && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            onClick={() => handleDelete(editingTask.id)}
                                            style={{ marginLeft: 'auto' }}
                                        >
                                            Löschen
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile-specific styles */}
            <style jsx="true">{`
        @media (max-width: 768px) {
          .fab-mobile {
            display: flex !important;
          }
          h1 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
        </Layout>
    );
};

export default KanbanBoard;
