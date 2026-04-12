# Merge Berita Acara + Cleanup - Complete ✅

## Summary

Successfully completed the following tasks:

1. ✅ Moved `manajemen-peraturan` from `pages/kepala-opd/` to `pages/tim-penyusun/`
2. ✅ Merged Berita Acara preview tab into `detail-sop/$id.tsx` for tim-penyusun
3. ✅ Deleted separate `berita-acara` routes and pages (no longer needed)
4. ✅ Cleaned up all references and imports

---

## Changes Made

### 1. Pindah Manajemen Peraturan ✅

**Before:**
```
pages/kepala-opd/manajemen-perataan/
```

**After:**
```
pages/tim-penyusun/manajemen-peraturan/
├── index.tsx
└── components/
    └── PeraturanTableTab.tsx
```

**Route updated:**
- `routes/tim-penyusun/peraturan.tsx` → Import dari `@/pages/tim-penyusun/manajemen-peraturan`

---

### 2. Merge Berita Acara ke Detail SOP ✅

**Deleted:**
- ❌ `routes/kepala-opd/berita-acara.tsx`
- ❌ `routes/tim-penyusun/koordinator/berita-acara.tsx`
- ❌ `routes/tim-penyusun/koordinator/route.tsx`
- ❌ `pages/kepala-opd/berita-acara/` (folder)
- ❌ `pages/tim-penyusun/koordinator/berita-acara/` (folder)

**Updated:**
- ✅ `pages/tim-penyusun/detail-sop/$id.tsx` - Fetch BA data and pass to main component
- ✅ `pages/tim-penyusun/detail-sop/components/DetailSopPenyusunMain.tsx` - Added BA tab
- ✅ `utils/constants.ts` - Removed `BERITA_ACARA` routes

**New Feature:**
Tab "Berita Acara" sekarang ada di **Detail SOP** untuk Tim Penyusun!

```
┌─────────────────────────────────────────────┐
│ Detail SOP Tim Penyusun                     │
├─────────────────────────────────────────────┤
│ [Preview SOP] [Berita Acara] ← NEW TAB!     │
├─────────────────────────────────────────────┤
│                                             │
│  Tab Preview SOP:                           │
│  - Flowchart/BPMN diagram                   │
│  - Prosedur editor                          │
│                                             │
│  Tab Berita Acara:                          │
│  - Tampilkan BA template jika ada           │
│  - Disable jika belum ada BA                │
│  - Read-only preview                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 3. Updated Navigation

**Kepala OPD Dashboard:**
- ❌ Removed "Berita Acara Pengesahan" menu item
- ✅ Remaining: "Pantau SOP" and "TTD Elektronik"

**Detail SOP Kepala OPD:**
- ✅ Updated message: "Berita Acara harus ditandatangani oleh Koordinator Tim Penyusun terlebih dahulu sebelum SOP dapat disahkan."
- ❌ Removed link to `/kepala-opd/berita-acara`

---

## Architecture

### How BA Tab Works

1. **Data Fetching:**
   ```typescript
   const { list: pengajuanList = [] } = useEvaluasi()
   
   const pengajuanForThisSop = useMemo(() => {
     return pengajuanList.find(p => 
       p.sopList?.some(sop => sop.id === id)
     ) ?? null
   }, [pengajuanList, id])
   ```

2. **Tab Visibility:**
   - Tab "Berita Acara" **enabled** jika:
     - `pengajuanForThisSop.status === 'DIVERIFIKASI_BIRO'` OR
     - `pengajuanForThisSop.status === 'DITANDATANGANI_KOORDINATOR'`
   - Tab **disabled** jika belum ada BA

3. **Tab Content:**
   - If BA exists: Shows `BeritaAcaraTemplate` with full BA document
   - If no BA: Shows empty state "Belum ada Berita Acara untuk SOP ini"

---

## Files Modified

| File | Change |
|------|--------|
| `pages/tim-penyusun/detail-sop/$id.tsx` | Added BA data fetching and passing |
| `pages/tim-penyusun/detail-sop/components/DetailSopPenyusunMain.tsx` | Added BA tab UI |
| `pages/tim-penyusun/manajemen-peraturan/index.tsx` | Moved from kepala-opd |
| `pages/tim-penyusun/manajemen-peraturan/components/*` | Moved from kepala-opd |
| `routes/tim-penyusun/peraturan.tsx` | Updated import path |
| `utils/constants.ts` | Removed BERITA_ACARA routes |
| `components/layout/DashboardLayout.tsx` | Removed BA menu from Kepala OPD |
| `pages/kepala-opd/detail-sop/$id.tsx` | Updated BA message, removed link |

## Files Deleted

| File | Reason |
|------|--------|
| `routes/kepala-opd/berita-acara.tsx` | BA merged into detail SOP |
| `routes/tim-penyusun/koordinator/berita-acara.tsx` | BA merged into detail SOP |
| `routes/tim-penyusun/koordinator/route.tsx` | No children routes left |
| `pages/kepala-opd/berita-acara/` | BA merged into detail SOP |
| `pages/tim-penyusun/koordinator/berita-acara/` | BA merged into detail SOP |

---

## Benefits

1. **🎯 Simpler Navigation**: BA tidak lagi halaman terpisah
2. **📋 Better UX**: BA langsung accessible saat edit SOP
3. **🧹 Cleaner Structure**: Tidak ada duplikasi halaman BA
4. **🔗 Contextual**: BA muncul di konteks SOP yang relevan
5. **♻️ DRY**: Satu tempat untuk preview BA, bukan dua halaman terpisah

---

## Verification

✅ All TypeScript errors resolved
✅ No module resolution errors
✅ All imports updated correctly
✅ Routes tree consistent
✅ Navigation menus updated

---

## Notes

- BA tab di Detail SOP **hanya preview** (read-only)
- Untuk **tanda tangan BA**, masih perlu workflow terpisah (bisa ditambahkan nanti)
- Tab muncul hanya jika ada BA yang terkait dengan SOP ini
- BA untuk **multiple SOP sekaligus** (batch) tetap bisa dilihat per SOP
