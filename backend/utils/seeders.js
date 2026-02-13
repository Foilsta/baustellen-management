export async function seedDatabase(isScript = false) {
    try {
        // Sync database (safe mode, no force: true)
        await sequelize.sync({ alter: true }); // 'alter' updates schema if needed without data loss
        console.log('Database synced');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (existingAdmin) {
            console.log('Database already seeded. Skipping.');
            if (isScript) process.exit(0);
            return;
        }

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

        console.log('✓ Database seeded successfully!');
        if (isScript) process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        if (isScript) process.exit(1);
        throw error;
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDatabase(true);
}
