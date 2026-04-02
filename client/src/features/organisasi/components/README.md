# Organisasi Feature Components

This directory contains UI components specific to organization management (OPD, Tim Penyusun, Tim Evaluasi).

## Current Status

**No components yet.**

The organisasi feature currently exposes:
- **Types**: OPD and team-related types
- **Services**: API calls for organization endpoints
- **Hooks**: `useOpdList()`, `useTimPenyusunList()`, `useTimEvaluasiList()`, etc.

## When to Add Components

Add components here when you need:
- OPD selection dropdowns
- Team member lists
- Organization chart displays
- Team assignment forms

## Usage

```typescript
// Future usage example
import { OpdSelect } from '@/features/organisasi/components/OpdSelect'
import { TeamMemberList } from '@/features/organisasi/components/TeamMemberList'
```

For now, import hooks directly from the feature barrel export:

```typescript
import { useOpdList, useTimPenyusunList } from '@/features/organisasi'
```
