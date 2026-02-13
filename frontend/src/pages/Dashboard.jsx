import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import UserAvatar from '../components/Common/UserAvatar';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        myTasks: [],
        openTasks: [],
        neededMaterials: [],
        taskStats: { open: 0, in_progress: 0, completed: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [myTasksRes, openTasksRes, materialsRes, allTasksRes] = await Promise.all([
                api.get('/tasks?assigned_to=me'),
                api.get('/tasks?status=open'),
                api.get('/materials?status=needed'),
                api.get('/tasks'),
            ]);

            // Calculate task statistics
            const allTasks = allTasksRes.data.tasks;
            const taskStats = {
                open: allTasks.filter(t => t.status === 'open').length,
                in_progress: allTasks.filter(t => t.status === 'in_progress').length,
                completed: allTasks.filter(t => t.status === 'completed').length,
            };

            const data = {
                myTasks: myTasksRes.data.tasks,
                openTasks: openTasksRes.data.tasks,
                neededMaterials: materialsRes.data.materials,
                taskStats,
            };

            setStats(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
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

    const totalTasks = stats.taskStats.open + stats.taskStats.in_progress + stats.taskStats.completed;
    const openPercentage = totalTasks > 0 ? (stats.taskStats.open / totalTasks) * 100 : 0;
    const inProgressPercentage = totalTasks > 0 ? (stats.taskStats.in_progress / totalTasks) * 100 : 0;
    const completedPercentage = totalTasks > 0 ? (stats.taskStats.completed / totalTasks) * 100 : 0;

    return (
        <Layout>
            <div className="container fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1>Willkommen, {user?.username}! 👋</h1>
                    <p className="text-muted">Hier ist eine Übersicht über Ihre Baustelle</p>
                </div>

                <div className="grid grid-2">
                    {/* Meine Aufgaben */}
                    <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
                        <div className="card-header flex-between">
                            <h3 className="card-title">📋 Meine Aufgaben</h3>
                            <span className="text-muted">{stats.myTasks.length}</span>
                        </div>
                        {stats.myTasks.length === 0 ? (
                            <p className="text-muted">Keine Aufgaben zugewiesen</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stats.myTasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/tasks`)}
                                        className="item-box"
                                    >
                                        <div className="flex-between mb-1">
                                            <strong>{task.title}</strong>
                                            <StatusBadge status={task.status} type="task" />
                                        </div>
                                        {task.description && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                                                {task.description.substring(0, 60)}...
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Offene Aufgaben */}
                    <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
                        <div className="card-header flex-between">
                            <h3 className="card-title">🔓 Offene Aufgaben</h3>
                            <span className="text-muted">{stats.openTasks.length}</span>
                        </div>
                        {stats.openTasks.length === 0 ? (
                            <p className="text-muted">Keine offenen Aufgaben</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stats.openTasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/tasks`)}
                                        className="item-box"
                                    >
                                        <div className="flex-between mb-1">
                                            <strong>{task.title}</strong>
                                            <StatusBadge status={task.status} type="task" />
                                        </div>
                                        {task.assignedTo ? (
                                            <div style={{ marginTop: '0.25rem' }}>
                                                <UserAvatar user={task.assignedTo} size="20px" showName />
                                            </div>
                                        ) : task.createdBy && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Erstellt von:</span>
                                                <UserAvatar user={task.createdBy} size="20px" showName />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Benötigte Materialien */}
                    <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/materials')}>
                        <div className="card-header flex-between">
                            <h3 className="card-title">📦 Benötigte Materialien</h3>
                            <span className="text-muted">{stats.neededMaterials.length}</span>
                        </div>
                        {stats.neededMaterials.length === 0 ? (
                            <p className="text-muted">Alle Materialien verfügbar</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stats.neededMaterials.slice(0, 5).map((material) => (
                                    <div
                                        key={material.id}
                                        onClick={() => navigate(`/materials`)}
                                        className="item-box"
                                    >
                                        <div className="flex-between mb-1">
                                            <strong>{material.name}</strong>
                                            <StatusBadge status={material.status} type="material" />
                                        </div>
                                        <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                                            Menge: {material.quantity} {material.unit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Statistics Pie Chart */}
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>📊 Aufgaben-Übersicht</h2>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                        {/* SVG Donut Chart */}
                        <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
                            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                {totalTasks === 0 ? (
                                    <circle
                                        cx="60" cy="60" r="50"
                                        fill="none"
                                        stroke="var(--border)"
                                        strokeWidth="16"
                                        opacity="0.5"
                                    />
                                ) : (
                                    <>
                                        {/* Completed segment */}
                                        <circle
                                            cx="60" cy="60" r="50"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="16"
                                            strokeDasharray={`${(completedPercentage / 100) * 314.16} 314.16`}
                                            strokeDashoffset="0"
                                            style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                        />
                                        {/* In Progress segment */}
                                        <circle
                                            cx="60" cy="60" r="50"
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="16"
                                            strokeDasharray={`${(inProgressPercentage / 100) * 314.16} 314.16`}
                                            strokeDashoffset={`${-((completedPercentage) / 100) * 314.16}`}
                                            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
                                        />
                                        {/* Open segment */}
                                        <circle
                                            cx="60" cy="60" r="50"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="16"
                                            strokeDasharray={`${(openPercentage / 100) * 314.16} 314.16`}
                                            strokeDashoffset={`${-((completedPercentage + inProgressPercentage) / 100) * 314.16}`}
                                            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
                                        />
                                    </>
                                )}
                            </svg>
                            {/* Center text */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {totalTasks}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {totalTasks === 1 ? 'Aufgabe' : 'Aufgaben'}
                                </div>
                            </div>
                        </div>

                        {/* Legend with numbers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: '#3b82f6', flexShrink: 0,
                                }}></div>
                                <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Offen</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#3b82f6' }}>
                                    {stats.taskStats.open}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: '#f59e0b', flexShrink: 0,
                                }}></div>
                                <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>In Bearbeitung</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#f59e0b' }}>
                                    {stats.taskStats.in_progress}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: '#10b981', flexShrink: 0,
                                }}></div>
                                <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Erledigt</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#10b981' }}>
                                    {stats.taskStats.completed}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

