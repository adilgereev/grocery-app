const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env' });
const remoteUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const remoteKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const remoteClient = createClient(remoteUrl, remoteKey);

const { Client } = require('pg');

// Все таблицы, которые мы хотим вытянуть (публичные таблицы)
const tablesToSync = [
  'categories',
  'products',
  'profiles',
  'addresses',
  'orders',
  'order_items',
  'cart_items'
];

async function syncAll() {
  const localClient = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
  await localClient.connect();

  try {
    console.log('Fetching remote data from:', remoteUrl);
    await localClient.query(`SET session_replication_role = replica`);
    
    for (const table of tablesToSync) {
      console.log(`Pulling ${table}...`);
      const { data, error } = await remoteClient.from(table).select('*').limit(1000);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('not found')) {
           console.log(`Table ${table} does not exist or access denied, skipping.`);
           continue;
        }
        console.warn(`Error pulling ${table}:`, error.message);
        continue;
      }
      
      console.log(`Found ${data ? data.length : 0} rows in ${table}.`);
      
      if (data && data.length > 0) {
        await localClient.query(`TRUNCATE TABLE public.${table} CASCADE`);
        
        const keys = Object.keys(data[0]);
        const columns = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `INSERT INTO public.${table} (${columns}) VALUES (${placeholders})`;

        for (const row of data) {
          const values = keys.map(k => row[k]);
          await localClient.query(queryText, values);
        }
      }
    }
    
    await localClient.query(`SET session_replication_role = DEFAULT`);
    await localClient.end();
    
    console.log('✅ All public data synced successfully to local Supabase!');
  } catch (err) {
    console.error('❌ Sync failed:', err);
  }
}

syncAll();
