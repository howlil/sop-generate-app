-- ============================================
-- Migration: Add Missing Indexes for Performance
-- ============================================
-- Created: 2 April 2026
-- Source: DATABASE SCHEMA AUDIT REPORT [P1-1]
-- 
-- Apply with: npx prisma db execute --file prisma/migrations/YYYYMMDDHHMMSS_add_indexes.sql
-- 
-- These indexes are critical for query performance at scale (>100k rows)

-- ============================================
-- Priority 1: Core Query Indexes
-- ============================================

-- [P1-1] SOP filtering by OPD + status (dashboard, lists)
CREATE INDEX IF NOT EXISTS idx_sop_opd_status ON SOP(opdId, status);

-- [P1-1] PengajuanEvaluasi filtering by OPD + status (evaluation queue)
CREATE INDEX IF NOT EXISTS idx_pengajuan_opd_status ON PengajuanEvaluasi(opdId, status);

-- [P1-1] PengajuanEvaluasi filtering by status + jenis (evaluation queue)
CREATE INDEX IF NOT EXISTS idx_pengajuan_status_jenis ON PengajuanEvaluasi(status, jenis);

-- [P1-1] NilaiEvaluasi lookup by pengajuan (load all nilai in pengajuan)
CREATE INDEX IF NOT EXISTS idx_nilai_pengajuan ON NilaiEvaluasi(pengajuanEvaluasiId);

-- ============================================
-- Priority 2: Reporting & Audit Indexes
-- ============================================

-- [P1-1] RiwayatTandaTangan lookup by SOP (check if SOP signed)
CREATE INDEX IF NOT EXISTS idx_riwayat_sop ON RiwayatTandaTangan(sopDetailId);

-- [P1-1] LogEditSOP audit trail per SOP (ordered by time)
CREATE INDEX IF NOT EXISTS idx_log_edit_sop ON LogEditSOP(sopDetailId, createdAt);

-- ============================================
-- Priority 3: Covering Indexes (Optional, MySQL 8.0+)
-- ============================================

-- [P3-2] Dashboard query optimization (SOP count per OPD)
-- Note: INCLUDE clause only available in MySQL 8.0+
-- For older MySQL, the composite index above is sufficient
-- CREATE INDEX idx_sop_dashboard ON SOP(opdId, status) INCLUDE (judul, createdAt);

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify indexes were created:
-- 
-- SHOW INDEX FROM SOP WHERE Key_name = 'idx_sop_opd_status';
-- SHOW INDEX FROM PengajuanEvaluasi WHERE Key_name LIKE 'idx_pengajuan%';
-- SHOW INDEX FROM NilaiEvaluasi WHERE Key_name = 'idx_nilai_pengajuan';
-- SHOW INDEX FROM RiwayatTandaTangan WHERE Key_name = 'idx_riwayat_sop';
-- SHOW INDEX FROM LogEditSOP WHERE Key_name = 'idx_log_edit_sop';
