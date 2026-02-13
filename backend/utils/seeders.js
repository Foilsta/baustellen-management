export async function seedDatabase(isScript = false) {
    try {
        // ... (logic)
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
