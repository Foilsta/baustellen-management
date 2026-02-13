import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import Button from '../components/Common/Button';

const Materials = () => {
    const { isAdmin } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: 'Stück',
        notes: '',
        status: 'needed',
    });

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            const res = await api.get('/materials');
            // Sort materials: needed first, ordered second, arrived last
            const sorted = res.data.materials.sort((a, b) => {
                const statusOrder = { needed: 1, ordered: 2, arrived: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            setMaterials(sorted);
        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMaterial) {
                await api.put(`/materials/${editingMaterial.id}`, formData);
            } else {
                await api.post('/materials', formData);
            }
            setShowModal(false);
            setEditingMaterial(null);
            setFormData({ name: '', quantity: 1, unit: 'Stück', notes: '', status: 'needed' });
            loadMaterials();
        } catch (error) {
            console.error('Error saving material:', error);
            alert('Fehler beim Speichern des Materials');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!confirm('Möchten Sie dieses Material wirklich löschen?')) return;
        try {
            await api.delete(`/materials/${materialId}`);
            loadMaterials();
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    const handleUpdateStatus = async (materialId, newStatus) => {
        try {
            await api.put(`/materials/${materialId}`, { status: newStatus });
            loadMaterials();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const openEditModal = (material) => {
        setEditingMaterial(material);
        setFormData({
            name: material.name,
            quantity: material.quantity,
            unit: material.unit,
            notes: material.notes || '',
            status: material.status,
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingMaterial(null);
        setFormData({ name: '', quantity: 1, unit: 'Stück', notes: '', status: 'needed' });
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
                        <h1>📦 Materialien</h1>
                        <p className="text-muted">Verwalten Sie alle Materialien für Ihre Baustelle</p>
                    </div>
                    <Button variant="secondary" onClick={openNewModal}>
                        + Neues Material
                    </Button>
                </div>

                <div className="grid grid-3" style={{ alignItems: 'start' }}>
                    {/* Needed Column */}
                    <div>
                        <h2 className="mb-3" style={{ color: '#ef4444', borderBottom: '2px solid #ef4444', paddingBottom: '0.5rem' }}>🔴 Benötigt</h2>
                        <div className="flex-col gap-1">
                            {materials.filter(m => m.status === 'needed').map((material) => (
                                <div key={material.id} className="card" style={{ marginBottom: '1rem' }}>
                                    <div className="flex-between mb-2">
                                        <h3>{material.name}</h3>
                                        <StatusBadge status={material.status} type="material" />
                                    </div>

                                    <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                                        <p>
                                            <strong>Menge:</strong> {material.quantity} {material.unit}
                                        </p>
                                        {material.notes && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.notes}
                                            </p>
                                        )}
                                        {material.createdBy && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.createdBy.username}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => handleUpdateStatus(material.id, 'ordered')}
                                        >
                                            Bestellt
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => openEditModal(material)}
                                        >
                                            ✏️
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleDeleteMaterial(material.id)}
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {materials.filter(m => m.status === 'needed').length === 0 && (
                                <p className="text-muted text-center">Keine Materialien benötigt</p>
                            )}
                        </div>
                    </div>

                    {/* Ordered Column */}
                    <div>
                        <h2 className="mb-3" style={{ color: '#f59e0b', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>🔵 Bestellt</h2>
                        <div className="flex-col gap-1">
                            {materials.filter(m => m.status === 'ordered').map((material) => (
                                <div key={material.id} className="card" style={{ marginBottom: '1rem' }}>
                                    <div className="flex-between mb-2">
                                        <h3>{material.name}</h3>
                                        <StatusBadge status={material.status} type="material" />
                                    </div>

                                    <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                                        <p>
                                            <strong>Menge:</strong> {material.quantity} {material.unit}
                                        </p>
                                        {material.notes && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.notes}
                                            </p>
                                        )}
                                        {material.createdBy && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.createdBy.username}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => handleUpdateStatus(material.id, 'arrived')}
                                        >
                                            Eingetroffen
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => openEditModal(material)}
                                        >
                                            ✏️
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleDeleteMaterial(material.id)}
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {materials.filter(m => m.status === 'ordered').length === 0 && (
                                <p className="text-muted text-center">Keine Bestellungen offen</p>
                            )}
                        </div>
                    </div>

                    {/* Arrived Column */}
                    <div>
                        <h2 className="mb-3" style={{ color: '#10b981', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem' }}>🟢 Eingetroffen</h2>
                        <div className="flex-col gap-1">
                            {materials.filter(m => m.status === 'arrived').map((material) => (
                                <div key={material.id} className="card" style={{ marginBottom: '1rem', opacity: 0.8 }}>
                                    <div className="flex-between mb-2">
                                        <h3>{material.name}</h3>
                                        <StatusBadge status={material.status} type="material" />
                                    </div>

                                    <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                                        <p>
                                            <strong>Menge:</strong> {material.quantity} {material.unit}
                                        </p>
                                        {material.notes && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.notes}
                                            </p>
                                        )}
                                        {material.createdBy && (
                                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                {material.createdBy.username}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => openEditModal(material)}
                                        >
                                            ✏️
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleDeleteMaterial(material.id)}
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {materials.filter(m => m.status === 'arrived').length === 0 && (
                                <p className="text-muted text-center">Noch kein Material eingetroffen</p>
                            )}
                        </div>
                    </div>
                </div>

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
                                {editingMaterial ? 'Material bearbeiten' : 'Neues Material'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Menge * (1-100)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            className="form-control"
                                            style={{ flex: 1 }}
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            required
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            className="form-control"
                                            style={{ width: '80px' }}
                                            value={formData.quantity}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                                                setFormData({ ...formData, quantity: val });
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Einheit *</label>
                                    <select
                                        className="form-control"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        required
                                    >
                                        <option value="Stück">Stück</option>
                                        <option value="lfm">lfm (Laufmeter)</option>
                                        <option value="m²">m² (Quadratmeter)</option>
                                        <option value="m³">m³ (Kubikmeter)</option>
                                        <option value="kg">kg (Kilogramm)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Notizen</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                                {editingMaterial && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="needed">Benötigt</option>
                                            <option value="ordered">Bestellt</option>
                                            <option value="arrived">Eingetroffen</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex-gap">
                                    <Button type="submit" variant="secondary">
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

export default Materials;
