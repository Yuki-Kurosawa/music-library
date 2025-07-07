# AGENT.md - Music Library Project

## Commands
- **Start**: `npm start` (Expo development server)
- **Build**: `npm run web` (web build), `npm run android` (Android), `npm run ios` (iOS)
- **Lint**: `npm run lint` (ESLint via Expo)
- **Reset**: `npm run reset-project` (reset to clean state)
- **API**: `cd net_api && dotnet run` (start .NET API server)

## Architecture
- **Frontend**: React Native with Expo Router (~5.1.0), TypeScript, file-based routing
- **Backend**: .NET 8.0 Web API in `net_api/` directory
- **Database**: SQLite schema defined in `DATABASE.md` and `DATABASE.sql`
- **Key folders**: `app/` (screens), `components/` (reusable UI), `hooks/` (custom hooks), `constants/` (app constants)

## Code Style
- **TypeScript**: Strict mode enabled, use `@/` path alias for imports
- **Components**: Follow `ThemedText.tsx` pattern - export type + component, use StyleSheet.create
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Props**: Use `type ComponentProps = BaseProps & { customProp?: string }`
- **Imports**: React Native imports first, then local imports with `@/` prefix
- **Theming**: Use `useThemeColor` hook for light/dark theme support
