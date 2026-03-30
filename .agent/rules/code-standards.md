# Code Standards: Quality & Logic

## General Rules
-   **Comments**: Write all comments in Russian.
-   **Imports**: No unused imports. Use `npm run lint` for verification.
-   **Logging**: No debug logs in production code (`console.log`, `console.warn`).
-   **Path Aliases**: Always use `@/*` for imports from project root.

## TypeScript Style
-   **Explicit Types**: Use interfaces and types instead of `any`.
-   **Zustand Stores**: Typing is mandatory for actions and state.

## Hooks & Dependencies
-   **exhaustive-deps**: Ensure all dependencies are included in `useEffect`, `useCallback`, and `useMemo`.
-   **useCallback**: Use for all functions passed as props to child components or used in `useEffect`.

## Path Rules
-   `utils/`: Business logic and utility functions.
-   `lib/`: Core library wrappers (e.g., Supabase, Auth).
-   `hooks/`: Reusable React Hooks.
