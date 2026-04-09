const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Настройки
const CSV_PATH = 'C:/Users/Adilgereev/Desktop/products/molochka/products_details.csv';
const IMAGES_DIR = 'C:/Users/Adilgereev/Desktop/products/molochka';
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY && !process.env.DRY_RUN) {
  console.error('ОШИБКА: SUPABASE_SERVICE_ROLE_KEY не задан в переменных окружения.');
  console.log('Запустите скрипт так: $env:SUPABASE_SERVICE_ROLE_KEY="ваш_ключ"; node scripts/import_products.js');
  process.exit(1);
}

const DRY_RUN = process.env.DRY_RUN === 'true' || false; 
const MAX_ROWS = 1000;

// R2 конфиг из supabase/functions/.env
const R2_UPLOAD_URL_FUNC = `${SUPABASE_URL}/functions/v1/get-upload-url`;
const BUCKET_FOLDER = 'products';

// Маппинг категорий
const CATEGORY_MAPPING = [
  { keywords: ['йогурт', 'десерт', 'творожок', 'teos'], id: '6e74c69f-b86c-4472-a94a-942174ab74d9' }, // Йогурты и десерты
  { keywords: ['кефир', 'сметана', 'творог', 'ряженка'], id: 'c9f3eb1f-ec63-4752-bb01-136b4729da56' }, // Кефир, сметана, творог
  { keywords: ['сыр'], id: 'cc12ced8-bc9d-4eae-ad2b-1b478e04e66c' }, // Сыры
  { keywords: ['молоко', 'масло', 'сливки'], id: '631f8808-eb3c-4b30-87b8-ee215cff1999' }, // Молоко, масло, яйца
];

async function uploadToR2(filePath) {
  try {
    const fileName = path.basename(filePath);
    // 1. Получаем presigned URL
    const { data } = await axios.post(R2_UPLOAD_URL_FUNC, 
      { folder: BUCKET_FOLDER, contentType: 'image/jpeg' },
      { 
        headers: { 
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        } 
      }
    );

    const { uploadUrl, cdnUrl } = data;

    // 2. Загружаем файл
    const fileBuffer = fs.readFileSync(filePath);
    await axios.put(uploadUrl, fileBuffer, {
      headers: { 'Content-Type': 'image/jpeg' }
    });

    return cdnUrl;
  } catch (error) {
    console.error(`Ошибка загрузки ${filePath}:`, error.message);
    return null;
  }
}

function parseUnit(name) {
  // Ищем 250г, 250 г, 140гр, 0.9л, 1кг. \b не работает с кириллицей, используем альтернативу.
  const match = name.match(/(\d+[.,]?\d*)\s*(г|гр|мл|кг|л)(?![а-яё])/i);
  if (match) {
    let u = match[2].toLowerCase();
    if (u === 'гр') return 'г';
    return u;
  }
  return 'шт';
}

function findCategoryId(name) {
  const lowerName = name.toLowerCase();
  for (const group of CATEGORY_MAPPING) {
    if (group.keywords.some(kw => lowerName.includes(kw))) {
      return group.id;
    }
  }
  return null;
}

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
}

async function run() {
  console.log('--- Старт импорта ---');
  
  let existingProductsMap = new Map();
  try {
    const { data: existing } = await axios.get(`${SUPABASE_URL}/rest/v1/products?select=id,name`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    });
    existing.forEach(p => existingProductsMap.set(p.name, p.id));
    console.log(`Загружено ${existingProductsMap.size} существующих товаров.`);
  } catch (err) {
    console.error('Не удалось загрузить существующие товары:', err.message);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split('\n');
  
  const imageFiles = fs.readdirSync(IMAGES_DIR);
  const normalizedImageFiles = imageFiles.map(f => ({
    original: f,
    normalized: normalize(f.replace('.jpg', ''))
  }));

  const productsToUpsert = [];

  let processedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    if (processedCount >= MAX_ROWS) break;
    
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.match(/(".*?"|[^",\s][^",]*|(?<=,|^)(?=,|$))/g);
    if (!parts || parts.length < 2) continue;

    const name = parts[0].replace(/^"|"$/g, '').trim();
    if (name === 'Название' || !name) continue;

    processedCount++;
    console.log(`Обработка [${processedCount}]: ${name}`);

    const priceStr = parts[1] ? parts[1].replace(/^"|"$/g, '').replace('₽', '').trim() : '';
    const composition = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : '';
    const nutrition = parts[3] ? parts[3].replace(/^"|"$/g, '').trim() : '';
    const info = parts[4] ? parts[4].replace(/^"|"$/g, '').trim() : '';

    const price = priceStr === '?' ? 0 : parseFloat(priceStr.replace(',', '.')) || 0;
    const unit = parseUnit(name);
    const categoryId = findCategoryId(name);

    // Поиск изображения по нормализованному имени (максимальное сходство)
    const normalizedName = normalize(name);
    let imageUrl = null;
    const matchedFile = normalizedImageFiles.find(f => normalizedName.includes(f.normalized) || f.normalized.includes(normalizedName));
    
    if (matchedFile) {
      const imagePath = path.join(IMAGES_DIR, matchedFile.original);
      if (!DRY_RUN) {
        imageUrl = await uploadToR2(imagePath);
      } else {
        imageUrl = 'http://dry-run-placeholder.com/' + matchedFile.original;
      }
      console.log(`  Найдено фото : ${matchedFile.original} -> ${imageUrl}`);
    } else {
      console.warn(`  Фото НЕ найдено для: ${name}`);
    }

    console.log(`  Unit: ${unit}, Price: ${price}, Category: ${categoryId}`);

    const productData = {
      name,
      description: [composition, nutrition, info].filter(Boolean).join('\n\n').trim(),
      price,
      unit,
      category_id: categoryId,
      image_url: imageUrl,
      stock: 100,
      is_active: price > 0,
      tags: ['imported', 'molochka']
    };

    if (existingProductsMap.has(name)) {
      productData.id = existingProductsMap.get(name);
    }

    productsToUpsert.push(productData);
  }

  console.log(`Подготовлено ${productsToUpsert.length} товаров. Загружаем в БД...`);
  if (DRY_RUN) {
    console.log('--- DRY RUN Завершено ---');
    return;
  }

  const chunkSize = 50;
  for (let i = 0; i < productsToUpsert.length; i += chunkSize) {
    const chunk = productsToUpsert.slice(i, i + chunkSize);
    try {
      await axios.post(`${SUPABASE_URL}/rest/v1/products`, chunk, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        }
      });
      console.log(`Загружено ${i + chunk.length} из ${productsToUpsert.length}...`);
    } catch (err) {
      console.error('Ошибка при вставке чанка в БД:', err.response?.data || err.message);
    }
  }

  console.log('--- Импорт завершен ---');
}

run();
