const { Client } = require('pg');

const users = [
  'postgres.eoycbrkzggkiysdyrasd',
  'postgres.db.eoycbrkzggkiysdyrasd',
  'postgres.eoycbrkzggkiysdyrasd.db',
  'eoycbrkzggkiysdyrasd',
  'db.eoycbrkzggkiysdyrasd'
];

async function testUsers() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  for (const user of users) {
    console.log(`Testing user: ${user}...`);
    const client = new Client({
      host: host,
      port: 5432,
      database: 'postgres',
      user: user,
      password: 'CycSfoH03Bm5HX7i',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected using user: ${user}`);
      await client.end();
      return;
    } catch (err) {
      console.log(`User ${user} failed: ${err.message}`);
    }
  }
}

testUsers();
