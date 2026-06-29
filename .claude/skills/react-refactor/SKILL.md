---
name: react-refactor
description: Use when restructuring or rebuilding the Cartwise React/Vite frontend while preserving existing API contracts and MVP behavior.
---

# React Refactor for Cartwise

Preserve:
- Express backend
- existing API endpoints
- scraper outputs
- SQLite bridge
- comparison logic
- MVP features

Frontend should be organized by feature:
- public
- dashboard
- products
- pending purchase
- comparison
- history
- lists
- pantry
- profile only if still needed

Keep shared logic in hooks/lib/domain.
Avoid duplicated state.
Do not keep a monolithic WebApp if feature-level components can own their own UI.

Run after changes:
- npm run lint
- npm run build

Do not change Scrapper unless explicitly asked.
