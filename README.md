# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   npx supabase functions serve --env-file supabase/functions/.env
   Terminal 1: cd grocery-app && npx supabase start  (если не запущен)
   Terminal 2: cd grocery-app && npx expo start       (мобильное приложение)
   Terminal 3: cd grocery-app/business-admin && npm run dev  (бизнес-админка) #  localhost:5173 http://127.0.0.1:5173/

   ```

   npm run db:dump снимает дамп schema + data + auth.users — при следующем восстановлении расхождений не будет

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Dev build на Android (Wi-Fi отладка)

### 1. Подготовка телефона (один раз)
1. Настройки → О телефоне → нажать **Номер сборки 7 раз**
2. Настройки → Для разработчиков → **Беспроводная отладка** → ON

### 2. Сопряжение (один раз)
В разделе "Беспроводная отладка" → **Подключить с помощью кода сопряжения**

```bash
adb pair <IP>:<порт сопряжения>
# ввести код с экрана телефона
```

### 3. Подключение (каждый раз)
IP и порт — на главном экране "Беспроводная отладка" (не в "Подключить с помощью кода")

```bash
adb connect <IP>:<порт подключения>
adb devices  # проверить что устройство видно
```

### 4. Запуск
```bash
npx expo run:android
```

### Переменные окружения (должны быть заданы)
- `ANDROID_HOME` = `D:\Apps\Android\Sdk`
- `JAVA_HOME` = `C:\Program Files\Java\jdk-23`
- `PATH` включает `D:\Apps\Android\Sdk\platform-tools`
