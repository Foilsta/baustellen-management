import { sequelize, User } from '../models/index.js';

async function seedDatabase() {
    try {
        // Sync database (creates tables)
        await sequelize.sync({ force: true });
        console.log('Database synced');

        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@baustelle.local',
            password: 'admin123',
            role: 'admin',
        });
        console.log('✓ Admin user created:', admin.username);

        // Create individual helper users
        const helpers = [
            { username: 'Lina', email: 'lina@baustelle.local', password: 'lina123' },
            { username: 'Max', email: 'max@baustelle.local', password: 'max123' },
            { username: 'Sarah', email: 'sarah@baustelle.local', password: 'sarah123' },
            { username: 'Tom', email: 'tom@baustelle.local', password: 'tom123' },
        ];

        for (const helperData of helpers) {
            const helper = await User.create({
                ...helperData,
                role: 'helper',
            });
            console.log('✓ Helper user created:', helper.username);
        }

        console.log('\n========================================');
        console.log('✓ Database seeded successfully!');
        console.log('========================================');
        console.log('\nLogin credentials:');
        console.log('\n👤 Admin:');
        console.log('   Username: admin, Password: admin123');
        console.log('\n👥 Helfer:');
        console.log('   Username: Lina,  Password: lina123');
        console.log('   Username: Max,   Password: max123');
        console.log('   Username: Sarah, Password: sarah123');
        console.log('   Username: Tom,   Password: tom123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();
