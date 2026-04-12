# Route Best Practices - Sistem Informasi SOP

## 📋 Current Route Structure (Role-Based)

```
/biro-organisasi/grafik-evaluasi
/biro-organisasi/opd
/tim-penyusun/sop
/tim-evaluasi/evaluasi
/kepala-opd/sop
```

## ❓ Kenapa Harus Ada Nama Role di Route?

### Jawaban: **Ini adalah best practice untuk multi-role apps!**

### 1. **Clear Ownership & Separation of Concerns**
Setiap role punya fitur yang berbeda. Route dengan prefix role membuat:
- ✅ Jelas fitur siapa ini
- ✅ Tidak ada konflik route antar role
- ✅ Mudah track fitur per role

### 2. **Security & Route Guards**
```tsx
// __root.tsx - Easy to check role-based access
beforeLoad: ({ location }) => {
  if (location.pathname.startsWith('/biro-organisasi')) {
    requireRole('BIRO_ORGANISASI')
  }
  if (location.pathname.startsWith('/tim-penyusun')) {
    requireRole('TIM_PENYUSUN')
  }
}
```

### 3. **Scalability**
```
/biro-organisasi/sop        ← Fitur SOP untuk Biro
/tim-penyusun/sop           ← Fitur SOP untuk Tim Penyusun
/kepala-opd/sop             ← Fitur SOP untuk Kepala OPD
```
Tanpa prefix role, kita tidak bisa punya 3 route yang sama (`/sop`)!

### 4. **Maintainability**
Developer baru bisa langsung tahu:
- `/biro-organisasi/**` = Fitur untuk Biro Organisasi
- `/tim-evaluasi/**` = Fitur untuk Tim Evaluasi
- `/kepala-opd/**` = Fitur untuk Kepala OPD

## ✅ Best Practice Pattern

### ✅ DO: Use Role Prefix
```tsx
export const ROUTES = {
  BIRO_ORGANISASI: {
    GRAFIK_EVALUASI: "/biro-organisasi/grafik-evaluasi",  // ✅
    OPD: "/biro-organisasi/opd",
    EVALUASI: "/biro-organisasi/evaluasi",
  },
  TIM_PENYUSUN: {
    SOP: "/tim-penyusun/sop",                             // ✅
    PELAKSANA: "/tim-penyusun/pelaksana",
  },
  TIM_EVALUASI: {
    EVALUASI: "/tim-evaluasi/evaluasi",                   // ✅
    DETAIL_EVALUASI_OPD: "/tim-evaluasi/evaluasi/opd/$opdId",
  },
} as const;
```

### ❓ Alternatives (Not Recommended for This App)

#### Alternative 1: Resource-Based Paths
```tsx
// Shorter but ambiguous
ROUTES = {
  GRAFIK_EVALUASI: "/grafik-evaluasi",
  SOP: "/sop",
  EVALUASI: "/evaluasi",
  OPD: "/opd",
}
```
**Why not?**
- ❌ Tidak jelas fitur siapa
- ❌ Sulit implement role-based access
- ❌ Konflik route antar role

#### Alternative 2: Feature-Based with Guards
```tsx
// Still need guards somewhere
ROUTES = {
  SOP_MANAGEMENT: "/sop",
  EVALUASI: "/evaluasi",
}
// + Complex guard logic based on user role
```
**Why not?**
- ❌ Need extra layer of complexity for auth
- ❌ Harder to debug
- ❌ Less explicit

## 🎯 Recommended Structure (Current is Good!)

```
/                              ← Landing page (public)
/auth/login                    ← Login (public)

/biro-organisasi/              ← Biro Organisasi dashboard
/biro-organisasi/grafik-evaluasi
/biro-organisasi/opd
/biro-organisasi/tim-penyusun
/biro-organisasi/tim-evaluasi
/biro-organisasi/evaluasi
/biro-organisasi/evaluasi/$id
/biro-organisasi/sop/$id
/biro-organisasi/tte

/tim-penyusun/                 ← Tim Penyusun dashboard
/tim-penyusun/sop
/tim-penyusun/sop/$id
/tim-penyusun/pelaksana
/tim-penyusun/peraturan
/tim-penyusun/koordinator/berita-acara
/tim-penyusun/koordinator/berita-acara/$id
/tim-penyusun/koordinator/tte

/kepala-opd/                   ← Kepala OPD dashboard
/kepala-opd/sop
/kepala-opd/sop/$id
/kepala-opd/tte

/tim-evaluasi/                 ← Tim Evaluasi dashboard
/tim-evaluasi/evaluasi
/tim-evaluasi/evaluasi/opd/$opdId

/validasi/ttd-berhasil         ← TTD validation (shared)
```

## 🔑 Key Principles

1. **Role Prefix** → Clear ownership
2. **Consistent Naming** → `MANAJEMEN_X` vs just `X` (pick one style)
3. **Params in Paths** → `$id`, `$opdId` for dynamic routes
4. **No Dashboard in Constants** → Dashboard is `/role-name/`, not `/role-name/dashboard`

## 📝 ROUTES Constant Best Practice

```tsx
export const ROUTES = {
  HOME: "/",
  
  // One object per role
  ROLE_NAME: {
    // Feature: path
    FEATURE_NAME: "/role-name/feature",
    FEATURE_DETAIL: "/role-name/feature/$id",
  },
} as const;

// Usage:
// ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI → "/biro-organisasi/grafik-evaluasi"
// ROUTES.TIM_EVALUASI.EVALUASI → "/tim-evaluasi/evaluasi"
```

## ✅ Conclusion

**Current structure dengan role prefix adalah BEST PRACTICE untuk aplikasi multi-role seperti ini!**

Jangan hapus role name dari route. Ini memberikan:
- ✅ Clear ownership
- ✅ Easy security implementation
- ✅ No route conflicts
- ✅ Better maintainability
