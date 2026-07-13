const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'me-central-1',
  'ap-east-1',
  'ap-southeast-3',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-2',
  'ca-central-1',
  'sa-east-1'
];

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Testing region ${region} via ${host}...`);
    const client = new Client({
      host: host,
      port: 5432,
      database: 'postgres',
      user: 'postgres.eoycbrkzggkiysdyrasd',
      password: 'CycSfoH03Bm5HX7i',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected successfully using region: ${region}`);
      await client.end();
      return;
    } catch (err) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        console.log(`Region ${region}: Tenant not found`);
      } else {
        console.log(`Region ${region}: Other error: ${err.message}`);
      }
    }
  }
  console.log('All regions tested. Connection failed.');
}

testRegions();
