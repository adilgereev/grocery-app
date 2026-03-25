const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gldhbgdlhsdtlncvkson.supabase.co';
const supabaseKey = 'sb_publishable_6lU6rpQOLqtaZdWPhGhCGQ_hJgTYjEL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) console.error(catError);
  else console.log('CAT:', JSON.stringify(categories, null, 2));

  const { data: products, error: prodError } = await supabase.from('products').select('*');
  if (prodError) console.error(prodError);
  else console.log('PROD:', JSON.stringify(products, null, 2));
}

checkProducts();
