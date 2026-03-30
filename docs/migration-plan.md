# FluxCP -> Node.js + React

## What exists now

- Entry point: `index.php`
- Router: `lib/Flux/Dispatcher.php`
- Core services: `lib/Flux/*`
- Business modules: `modules/*`
- Presentation layer: `themes/default/*` and `themes/bootstrap/*`
- Configuration: `config/*.php`
- SQL schemas and runtime data: `data/*`

## Main migration observation

FluxCP already separates module logic from view templates. That makes the migration workable if we keep the old information architecture and port it in this order:

1. Keep the route semantics: `module/action`
2. Rebuild the shared shell in React using the original theme assets
3. Move each PHP module into a typed Node.js service and JSON endpoint
4. Replace PHP session/auth code with Express session or JWT-backed auth
5. Port module views one by one into React pages

## Proposed target structure

- `modern/server`
  - Express API
  - rAthena data access
  - auth/session layer
  - module services
- `modern/src`
  - React application shell
  - route pages mirroring Flux modules
  - shared UI components preserving the current look

## Next migration phases

### Phase 1

- Rebuild `themes/default/header.php`, sidebar, login box, content wrapper and footer in React
- Serve original CSS and image assets unchanged
- Expose mock JSON endpoints to decouple frontend migration from backend rewrite

### Phase 2

- Port read-only pages first:
  - `main`
  - `news`
  - `server/status`
  - `ranking/*`
  - `item`
  - `monster`
  - `guild`

### Phase 3

- Port authenticated account flows:
  - `account/login`
  - `account/create`
  - `account/view`
  - `account/changepass`
  - `character/*`

### Phase 4

- Port operational/admin modules:
  - `servicedesk`
  - `cplog`
  - `logdata`
  - `ipban`
  - `pages`
  - `itemshop`

### Phase 5

- Port risky/payment modules only after auth, audit and schema mapping are stable:
  - `donate`
  - `purchase`
  - `webcommands`

## Module mapping draft

- `modules/main` -> `modern/src/pages/HomePage.tsx`
- `modules/news` -> `modern/src/pages/NewsPage.tsx`
- `modules/server/status.php` -> `modern/src/pages/ServerStatusPage.tsx` + `modern/server`
- `themes/default/*` -> `modern/src/components/*` + `modern/public/legacy-theme/*`

