-- Добавление колонки для ручных трансформаций изображений в категориях
ALTER TABLE "public"."categories" ADD COLUMN "image_transformations" text;

-- Примеры настроек для текущих подкатегорий (сдвигаем MILK и другие для лучшей видимости)
UPDATE "public"."categories" 
SET "image_transformations" = 'fo-bottom' 
WHERE "id" = '631f8808-eb3c-4b30-87b8-ee215cff1999'; -- Молоко, масло, яйца (сдвигаем к нижней части, где бутылки)

UPDATE "public"."categories" 
SET "image_transformations" = 'fo-center' 
WHERE "id" = 'c9f3eb1f-ec63-4752-bb01-136b4729da56'; -- Кефир, сметана, творог

UPDATE "public"."categories" 
SET "image_transformations" = 'fo-top' 
WHERE "id" = 'cc12ced8-bc9d-4eae-ad2b-1b478e04e66c'; -- Сыры
