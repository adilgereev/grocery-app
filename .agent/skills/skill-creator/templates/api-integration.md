---
name: [skill-name]
description: [When to trigger, what it does. Be specific and include examples of user phrases.]
---
# API Integration Skill Template

This skill provides the structure and instructions for integrating a new external API into the Grocery App.

## 🔑 Authentication
- **Method**: [API Key, OAuth2, etc.]
- **Storage**: Store keys in `.env` and `.env.local`. Use `EXPO_PUBLIC_` prefix for client-side access.
- **Header Structure**: `Authorization: Bearer <token>` or custom header.

## 📡 Endpoint Mapping
- **Base URL**: [API Base URL]
- **Key Resources**:
  - `GET /resource`: Description
  - `POST /resource`: Description
- **Request/Response Formats**: [Usually JSON]

## 🛠️ Implementation Rules
1. **API Client**: Use `lib/` for the shared API client (e.g., `lib/paymentApi.ts`).
2. **Error Handling**: Use `try/catch` with specialized error types.
3. **Mocking**: Always provide a mock implementation in `jest.setup.js` for testing.
4. **Zustand Sync**: Define if the API data is persisted in a store (`store/`).

## 🧪 Testing Protocol
- **Mocks**: Ensure `msw` or `jest.mock` is used to avoid real network calls during tests.
- **Success Case**: Verify correct data transformation.
- **Fail Case**: Verify error banners or retry logic.

## 📂 File Paths
- `lib/[name]Api.ts`: Core API client.
- `types/[name].ts`: Response and request interfaces.
- `components/[name]Input.tsx`: UI interaction (if any).
