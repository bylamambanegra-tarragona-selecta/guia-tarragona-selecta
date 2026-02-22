const { Client } = require('pg');

async function testConnection(port, pgbouncer) {
    const connectionString = `postgresql://postgres:fpZp_g.2n7ieZJ4@db.tmazdmodgpqsjtsazesl.supabase.co:${port}/postgres${pgbouncer ? '?pgbouncer=true' : ''}`;
    console.log(`Testing port ${port}...`);
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    try {
        await client.connect();
        console.log(`✅ SUCCESS on port ${port}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED on port ${port}: ${err.message}`);
        return false;
    }
}

async function run() {
    await testConnection(5432, false);
    await testConnection(6543, true);
}

run();
