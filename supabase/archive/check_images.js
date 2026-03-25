const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // Используем node-fetch если версия node < 18, иначе встроенный fetch

const supabaseUrl = 'https://gldhbgdlhsdtlncvkson.supabase.co';
const supabaseKey = 'sb_publishable_6lU6rpQOLqtaZdWPhGhCGQ_hJgTYjEL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrl(url, context) {
  if (!url || !url.startsWith('http')) return { ok: true };
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      console.log(`[BROKEN] ${context}: ${url} (Status: ${response.status})`);
      return { ok: false, status: response.status };
    }
    return { ok: true };
  } catch (err) {
    console.log(`[ERROR] ${context}: ${url} (${err.message})`);
    return { ok: false, error: err.message };
  }
}

async function runAudit() {
  console.log('--- STARTING IMAGE AUDIT ---');
  
  // 1. Categories
  const { data: categories } = await supabase.from('categories').select('*');
  for (const cat of categories) {
    await checkUrl(cat.image_url, `Category: ${cat.name}`);
    await new Promise(r => setTimeout(r, 100)); // Задержка 100мс
  }

  // 2. Products
  const { data: products } = await supabase.from('products').select('*');
  for (const prod of products) {
    await checkUrl(prod.image_url, `Product: ${prod.name}`);
    await new Promise(r => setTimeout(r, 100)); // Задержка 100мс
  }

  console.log('--- AUDIT FINISHED ---');
}

runAudit();
