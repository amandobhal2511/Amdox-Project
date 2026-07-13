const { Client } = require('pg');

const hosts = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com'
];

async function testPoolerPort() {
  for (const host of hosts) {
    console.log(`Connecting to ${host} on port 6543...`);
    const client = new Client({
      host: host,
      port: 6543,
      database: 'postgres',
      user: 'postgres.eoycbrkzggkiysdyrasd',
      password: 'CycSfoH03Bm5HX7i',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected to ${host} on port 6543!`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed on ${host}: ${err.message}`);
    }
  }
}

testPoolerPort();
