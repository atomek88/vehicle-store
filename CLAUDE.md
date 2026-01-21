# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Junkyard Tracker** is a production-grade vehicle inventory management prototype demonstrating enterprise-level architecture patterns with comprehensive test coverage.

**Tech Stack**: Next.js 16.1.3, React 19, TypeScript (strict), Tailwind CSS v4, Zod, React Hook Form, Vitest, Playwright

### Core Features

- Manages 4 vehicle types: Sedan, Coupe, Mini-Van, Motorcycle (each with unique attributes)
- Full CRUD operations with validation, filtering, sorting, and search
- Deterministic registration simulation (success/failure based on business rules)
- Client-only persistence via localStorage with versioned schema
- 3,392 lines of test code: 100+ unit tests, 6+ integration tests, 31 E2E tests

### Architecture Principles

1. **Layered Architecture**: Presentation → Service → Domain → Persistence
2. **Result Type Pattern**: Explicit error handling, no exceptions for control flow
3. **Type Safety**: Discriminated unions, strict TypeScript, Zod validation
4. **Test-Driven**: Colocated unit tests, comprehensive coverage at all layers

## Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Production build
npm run start                  # Run production build

# Testing
npm run test                   # Unit tests (Vitest)
npm run test -- --watch        # Watch mode
npm run test:e2e              # E2E tests (Playwright)
npm run test:e2e -- --ui      # E2E UI mode
npm run test:coverage         # Coverage reports

# Linting
npm run lint                   # ESLint with Next.js rules
```

## Architecture

### 4-Layer Structure

```
Presentation (app/ + src/components/)
    ↓
Service (src/lib/vehicle-service.ts, registration.ts)
    ↓
Domain/Validation (src/types/, src/validations/)
    ↓
Persistence (src/lib/storage.ts)
```

### Key Files

```
app/
├── layout.tsx                      # Root: VehicleProvider + ToastProvider
├── vehicles/
│   ├── page.tsx                    # Dashboard (list, filters, CRUD)
│   └── [id]/
│       ├── page.tsx                # Vehicle details
│       └── edit/page.tsx           # Edit form
└── registration-log/page.tsx       # Registration status view

src/
├── types/index.ts                  # All TypeScript types
├── validations/
│   ├── schemas.ts                  # Zod schemas (form + persisted)
│   └── schemas.test.ts             # 32 unit tests
├── lib/
│   ├── vehicle-service.ts          # CRUD operations
│   ├── registration.ts             # Registration business rules
│   ├── storage.ts                  # localStorage repository
│   ├── defaults.ts                 # Default value derivation
│   └── *.test.ts                   # Colocated unit tests
├── hooks/
│   ├── use-vehicles.tsx            # Context + reducer (state mgmt)
│   ├── use-vehicles.test.tsx       # 30+ tests
│   └── use-toast.tsx               # Toast notifications
└── components/
    ├── ui/                         # Button, Input, Select, Badge, Toast, ConfirmDialog
    ├── layout/Header.tsx
    └── vehicle/                    # VehicleForm, VehicleTable, FiltersBar, etc.

tests/
├── setup.ts                        # Test config (localStorage mock)
├── integration/vehicle-crud.spec.ts
└── e2e/*.spec.ts                   # 31 Playwright tests
```

## Domain Model

### Vehicle Types (Discriminated Union)

```typescript
type Vehicle = Sedan | Coupe | MiniVan | Motorcycle;

// Constraints:
// Sedan:      wheels (0-4), doors (0-4)
// Coupe:      wheels (0-4), doors (0-2)
// Mini-Van:   wheels (0-4), doors (0-4), doorConfig[] (length === doors)
// Motorcycle: wheels (0-2), seatStatus
```

### Registration (Immutable after creation)

```typescript
type Registration =
  | { status: 'registered'; registrationId: string }
  | { status: 'failed'; registrationError: string };
```

**Failure Rules**: Sedans fail if mileage > 100k, Motorcycles fail if mileage > 50k

### Business Rules

| Rule | Enforcement |
|------|-------------|
| Nickname uniqueness | Case-insensitive at service layer |
| Type immutability | Cannot change during edit |
| Registration immutability | Cannot change after creation |
| Mini-van doorConfig | Auto-reconciled when doors count changes |
| Mileage rating | Computed: low (<10k), medium (10k-100k), high (>100k) |

## State Management

**Pattern**: `useReducer` + Context (no external libraries)

```typescript
interface VehicleState {
  vehicles: Vehicle[];
  filters: VehicleFilters;
  sorting: VehicleSorting;
  hydrationStatus: 'idle' | 'loading' | 'ready' | 'error';
}
```

**Data Flow**:
1. Mount → hydrate from localStorage
2. Action → reducer updates state
3. Effect → sync to localStorage
4. Selectors → memoized filtering/sorting

## Error Handling (Result Type Pattern)

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// All services return Result instead of throwing
const result = await createVehicle(data);
if (!result.ok) {
  showToast('error', result.error);
  return;
}
const vehicle = result.value; // Type-safe access
```

## Testing

### Test Pyramid
- **Unit**: 100+ tests (colocated `*.test.ts` files, Vitest + RTL)
- **Integration**: 6+ tests (`tests/integration/*.spec.ts`, Vitest)
- **E2E**: 31 tests (`tests/e2e/*.spec.ts`, Playwright)

### Running Specific Tests
```bash
npm run test src/lib/vehicle-service.test.ts
npm run test:e2e tests/e2e/create-vehicle.spec.ts
```

## TypeScript Configuration

- **Strict mode**: Enabled + `noUncheckedIndexedAccess`
- **Path alias**: `@/*` → project root
- **Module resolution**: bundler
- **JSX**: react-jsx (React 17+ transform)

## Styling (Tailwind CSS v4)

**Key Differences from v3**:
- Import: `@import "tailwindcss"` in CSS
- Config: `@theme inline` directive (no separate config file)
- Plugin: `@tailwindcss/postcss`

**CSS Variables** (`app/globals.css`):
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

**Responsive**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

## Common Patterns

### 1. Discriminated Unions with Type Narrowing
```typescript
if (vehicle.type === 'mini-van') {
  vehicle.doorConfig // TypeScript knows this exists
}
```

### 2. Exhaustive Switch Statements
```typescript
switch (vehicle.type) {
  case 'sedan': return <SedanFields />;
  case 'coupe': return <CoupeFields />;
  case 'mini-van': return <MiniVanFields />;
  case 'motorcycle': return <MotorcycleFields />;
  default:
    const _exhaustive: never = vehicle.type; // Compile error if not exhaustive
    return null;
}
```

### 3. Service Layer Returns Result Types
```typescript
// ✅ Good
export function createVehicle(data: Input): Result<Vehicle, string> {
  if (isNicknameTaken(data.nickname)) {
    return { ok: false, error: 'Nickname already exists' };
  }
  return { ok: true, value: vehicle };
}

// ❌ Bad - Don't throw for control flow
throw new Error('Nickname already exists');
```

### 4. Colocated Unit Tests
```
src/lib/vehicle-service.ts
src/lib/vehicle-service.test.ts  ← Same directory
```

## Common Tasks

### Adding a New Vehicle Type
1. Update `VEHICLE_TYPES` in `src/types/index.ts`
2. Create interface extending `VehicleBase`, add to `Vehicle` union
3. Add Zod schema in `src/validations/schemas.ts`
4. Create `TypeNameFields.tsx` component
5. Update `VehicleForm.tsx` switch statement
6. Add registration logic in `src/lib/registration.ts` (if needed)
7. Write unit tests

### Adding a New Filter
1. Update `VehicleFilters` in `src/types/index.ts`
2. Add reducer action in `use-vehicles.tsx`
3. Update `selectFilteredVehicles` selector
4. Add UI controls in `FiltersBar.tsx`
5. Write tests in `use-vehicles.test.tsx`

### Debugging Storage
```typescript
// Browser console
JSON.parse(localStorage.getItem('junkyard.vehicles') || '{}')
localStorage.removeItem('junkyard.vehicles') // Clear
```

## Implementation Status

**✅ Completed (EPIC 1-6)**:
- Foundation: Types, schemas, validation (32 tests)
- Services: Storage, registration, vehicle service (100+ tests)
- State: Reducer, context, selectors (30+ tests)
- UI: All components + pages
- Testing: Unit, integration, E2E (31 E2E tests)
- Polish: Toasts, confirmations, responsive design, accessibility

**🔄 Future (EPIC 7)**: Manual accessibility testing, responsive validation, exploratory testing

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State | `useReducer` + Context | Minimal deps, testable |
| Forms | React Hook Form + Zod | Type inference, performance |
| Testing | Vitest + Playwright | Modern, fast, ESM-native |
| Error handling | Result type | Explicit paths, no exceptions |
| Storage | Versioned localStorage | Migration support |

## Important Notes

- **All vehicle pages are Client Components** (`'use client'`) due to localStorage usage
- **No SSR for vehicle data** (client-only prototype)
- **Path alias**: Use `@/` imports (e.g., `@/types`, `@/components/ui/Button`)
- **Test philosophy**: Tests drive design, colocated with source

## References

- `TECHNICAL_DESIGN.md` — Complete architecture specification
- `PROJECT_PLAN.md` — Implementation roadmap with Epic/Story breakdown
- `SUMMARY.md` — Executive overview and design rating
