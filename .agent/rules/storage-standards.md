# Storage Standards: Media & Image Management

## 1. 🏗️ Архитектура хранения

Проект использует **Cloudflare R2** как хранилище и **ImageKit** как CDN с трансформациями.

```
Клиент → Edge Function (get-upload-url) → presigned PUT URL → R2
Клиент → ImageKit CDN URL с параметрами → оптимизированное изображение
```

- **R2** — объектное хранилище. Секретный ключ R2 никогда не покидает сервер.
- **ImageKit** — CDN-прокси поверх R2. Трансформации применяются через URL-параметры.
- **Папки**: только `products/` и `categories/` (типизировано как `'products' | 'categories'`).

---

## 2. ⬆️ Загрузка изображений

**Всегда использовать** `uploadImage(uri, folder)` из `lib/utils/storageUtils.ts`.

```ts
import { uploadImage } from '@/lib/utils/storageUtils';

const cdnUrl = await uploadImage(localUri, 'products');
// возвращает публичный ImageKit CDN URL
```

**Никогда** не загружать файлы напрямую с клиента — ключи R2 хранятся только в Edge Function.

---

## 3. 🖼️ Отображение и оптимизация (ImageKit)

Использовать `getOptimizedImage(url, options)` из `lib/utils/imageKit.ts`.

```ts
import { getOptimizedImage, getPlaceholderUrl } from '@/lib/utils/imageKit';

// Карточка товара (300px, Retina, WebP)
const src = getOptimizedImage(product.image_url, {
  width: 300,
  quality: 80,
  smartCrop: true,
  dpr: 'auto',  // автоматически подбирает 1x/2x/3x под экран
});

// LQIP — микро-превью для моментальной загрузки (20px, blur)
const placeholder = getPlaceholderUrl(product.image_url);
```

**Ключевые параметры `ImageOptions`:**

| Параметр | Описание | По умолчанию |
|---|---|---|
| `width` / `height` | Размеры в логических пикселях | — |
| `quality` | Качество сжатия (1–100) | `80` |
| `format` | Формат (`'auto'` = WebP где поддерживается) | `'auto'` |
| `smartCrop` | Умная обрезка с фокусом на объекте (`fo-auto`) | `false` |
| `dpr` | Плотность пикселей (`'auto'` = `PixelRatio.get()`) | `'auto'` |
| `blur` | Размытие (используется в LQIP) | — |
| `v` | Версия для инвалидации кеша | — |

---

## 4. 🚫 Заглушки при отсутствии изображения

- `getOptimizedImage(null)` и `getOptimizedImage('')` возвращают `''` — безопасно.
- При пустом URL отображать `<Skeleton />` из `components/ui/Skeleton.tsx`.
- Не показывать сломанные `<Image />` с пустым источником.

---

## 5. 📂 Ключевые файлы

| Файл | Назначение |
|---|---|
| `lib/utils/storageUtils.ts` | `uploadImage()` — загрузка через presigned URL в R2 |
| `lib/utils/imageKit.ts` | `getOptimizedImage()`, `getPlaceholderUrl()` — CDN трансформации |
| `components/ui/Skeleton.tsx` | Заглушка при загрузке / отсутствии изображения |
