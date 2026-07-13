const { Client } = require('pg');

async function testSNI() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  console.log(`Connecting to pooler ${host} with SNI servername...`);
  const client = new Client({
    host: host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'CycSfoH03Bm5HX7i',
    ssl: {
      rejectUnauthorized: false,
      servername: 'db.eoycbrkzggkiysdyrasd.supabase.co'
    },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log('SUCCESS! Connected using SNI servername routing!');
    await client.end();
  } catch (err) {
    console.log(`Connection failed: ${err.message}`);
    console.log('Full error:', err);
  }
}

testSNI();
