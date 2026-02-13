import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Materials from './pages/Materials';
import Settings from './pages/Settings';

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/tasks"
                element={
                    <ProtectedRoute>
                        <KanbanBoard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/materials"
                element={
                    <ProtectedRoute>
                        <Materials />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
