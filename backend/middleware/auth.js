import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Keine Authentifizierung gefunden' });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Benutzer nicht gefunden' });
        }

        req.user = user;

        // Update lastSeen timestamp (non-blocking, avoid hooks)
        User.update({ lastSeen: new Date() }, { where: { id: user.id }, hooks: false }).catch(() => { });

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Ungültiger Token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token abgelaufen' });
        }
        res.status(500).json({ error: 'Authentifizierungsfehler' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Administratorrechte erforderlich' });
    }
    next();
};
