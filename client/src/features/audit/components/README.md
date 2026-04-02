# Audit Feature Components

This directory contains UI components specific to the audit domain.

## Current Status

**No components yet.** 

The audit feature currently exposes:
- **Types**: Audit log types and DTOs
- **Services**: API calls for audit endpoints
- **Hooks**: `useAuditBySopDetail()` and other query hooks

## When to Add Components

Add components here when you need:
- Audit log display panels
- Audit filter/search UI
- Audit report viewers

## Usage

```typescript
// Future usage example
import { AuditLogPanel } from '@/features/audit/components/AuditLogPanel'
```

For now, import hooks directly from the feature barrel export:

```typescript
import { useAuditBySopDetail } from '@/features/audit'
```
