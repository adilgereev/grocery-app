# 🌌 Global Antigravity Config (GEMINI.md)

## 🇷🇺 Language & Communication
- **Russian Only**: Писать все комментарии к коду исключительно на **русском языке**.
- **Concise Responses**: Отвечать кратко и по существу.

## 🛠️ TypeScript & Code Standards
- **Strict Typing**: Никогда не использовать `any`. Всегда описывать интерфейсы или типы.
- **Return Types**: Всегда указывать типы возвращаемых значений для функций и хуков.
- **No Raw Colors**: Запрещено использовать hex-коды или `rgba()` напрямую в компонентах. Только `Colors.light.*` токены из `constants/theme.ts`.
- **No Magic Numbers**: Отступы через `Spacing.*`, радиусы через `Radius.*`, размеры шрифтов через `FontSize.*`.
- **Boy Scout Rule**: Оставлять код чуть чище — удалять неиспользуемые импорты, исправлять мелкие ошибки типизации в соседних строках.

## 🎨 UI: Soft Minimalism
- **Стиль**: Soft Minimalism — мягкие нейтральные тени, экстремальное скругление, pill-форма для кнопок.
- **Тени**: `shadowColor: Colors.light.text`, `shadowOpacity: 0.03–0.05`, `shadowRadius: 12–16`. Нейтральный серый, не цветной. `elevation: 0` на Android.
- **Скругление**: Карточки — `Radius.xxl (24)`, кнопки/инпуты — `Radius.pill (999)`.
- **Фон**: Экраны — `#F9FAFB`, карточки — `#ffffff`.

## 🎨 Монохромная палитра
- `primary` `#10B981` — бренд, навигация, иконки, выделение
- `cta` `#059669` — ТОЛЬКО кнопки главного действия ("В корзину", "Оформить заказ")
- `ctaDark` `#047857` — pressed-состояние CTA
- Правило 60-30-10: 60% нейтраль, 30% primary, 10% CTA
- `error`/`warning`/`success`/`info` — только для статусов, не для декора

## 🗄️ Backend & Storage
- **БД**: Supabase (PostgreSQL + RLS + Auth + Edge Functions).
- **Хранилище**: Cloudflare R2 + ImageKit CDN (не Supabase Storage).
  - Upload: `uploadImage(uri, folder)` из `lib/utils/storageUtils.ts` (presigned URL).
  - Оптимизация: `getOptimizedImage(url, options)` из `lib/utils/imageKit.ts`.
- **Типы**: После любого изменения схемы — `npm run supabase:types`. Никогда не редактировать `types/supabase.ts` вручную.

## 🔀 Навигация (Expo Router)
- **Файловая структура**: `app/` — все маршруты.
- **Stack-экраны**: `headerShown: false` в layout + обязательный `<ScreenHeader />` внутри экрана.
- **SafeAreaView**: `edges={['bottom']}` для stack-экранов, из `react-native-safe-area-context`.
- **testID**: Обязателен на всех интерактивных и навигационных элементах.

## 🤖 AI Collaboration Strategy
- **Smart Decomposition**: Если файл превышает **200 строк** — предлагать декомпозицию.
- **No Placeholders**: Никогда не оставлять `// TODO` или пустые реализации.
- **Autonomous Verification**: После реализации — предлагать `npm test` или `/verify`.
- **Tests as Contracts**: Перед изменением логики — анализировать существующие тесты.

## 📁 Project Structure
- Правила, скиллы и воркфлоу — в `.agent/` внутри репозитория.
- **Скиллы**: `supabase`, `testing`, `navigation`, `skill-creator`.
- **Воркфлоу**: `verify-task`, `supabase-sync`.
