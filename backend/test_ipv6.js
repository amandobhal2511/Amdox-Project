const { Client } = require('pg');

async function testIPv6() {
  const host = '[2406:da18:167b:f900:f2d:662b:cd05:60f]';
  console.log(`Connecting directly to IPv6 host: ${host}...`);
  const client = new Client({
    host: host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'CycSfoH03Bm5HX7i',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log('SUCCESS! Connected directly via IPv6 address!');
    await client.end();
  } catch (err) {
    console.log(`Connection failed: ${err.message}`);
    console.log('Full error:', err);
  }
}

testIPv6();
