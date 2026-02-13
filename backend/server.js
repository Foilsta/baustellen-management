import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import materialRoutes from './routes/materials.js';
import activityRoutes from './routes/activity.js';
import { seedDatabase } from './utils/seeders.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Etwas ist schief gelaufen!' });
});

// DIRECT DEBUG ROUTE (Fallback)
import { User } from './models/index.js';
app.get('/debug-db', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['username', 'email', 'role'] });
        res.json({ status: 'Online', users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Database connection and server start
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established');

        // Sync database and seed if empty
        try {
            await seedDatabase(false);
            console.log('✓ Database/Seeding check completed');
        } catch (seedError) {
            console.error('⚠️ Seeding failed but server is starting:', seedError);
        }
        // console.log('✓ Database synchronized');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
