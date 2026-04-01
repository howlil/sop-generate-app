# .skills/ Directory — FYP Optimized

**Last Updated:** 2026-04-01  
**Optimization:** 60-70% complexity reduction for solo final year project

---

## 🎯 What Changed

### Before Optimization
- **16 skills** with 120+ analysis phases
- **500+ pages** of documentation
- **8-15 hours** per skill invocation
- **Risk:** Analysis paralysis → no implementation

### After Optimization
- **9 active skills** with 25 analysis phases (-79%)
- **150 pages** of documentation (-70%)
- **2-4 hours** per skill invocation (-75%)
- **Focus:** Implementation over analysis

---

## 📁 Directory Structure

```
.skills/
├── SKILLS-INDEX.md          # Master index (updated)
├── README-FYP.md            # This file
│
├── # Core Skills (6)
├── backend-fyp.md           # Simplified NestJS implementation
├── database-fyp.md          # Simplified database audit
├── qa-fyp.md                # Simplified testing strategy
├── security-auditor.md      # TTE security focus
├── api-contract-designer.md # API spec before coding
├── sytem-analyst.md         # PRD + Bab 3 documentation
│
├── # FYP-Specific Skills (3)
├── thesis-writer.md         # Bab 4 + Bab 5 documentation
├── demo-preparer.md         # Thesis defense demo prep
├── scope-guardian.md        # Prevent feature creep
│
└── archive/                 # Archived skills (8)
    ├── fullstack-audit.md
    ├── performance-optimizer.md
    ├── migration-engineer.md
    ├── ux-auditor.md
    ├── documentation-writer.md
    ├── system-arch.md
    ├── db-audit.md
    └── system-fe-prd.md
```

---

## 🚀 Quick Start

### Week-by-Week Guide

| Week | Skill to Invoke | Task | Time Budget |
|------|-----------------|------|-------------|
| 2-3 | `database-fyp` | Prisma schema + constraints | 2-3 hours |
| 4-5 | `backend-fyp` + `api-contract-designer` | Core SOP APIs | 25-30 hours/module |
| 6 | `security-auditor` | TTE security audit | 2-3 hours |
| 7 | `qa-fyp` | Testing critical flows | 15-20 hours |
| 8 | `system-analyst` | Bab 3 documentation | 8-10 hours |
| 9-10 | — | Bug fixes + polish | As needed |
| 11 | `demo-preparer` | Demo preparation | 4-6 hours |
| 12 | `thesis-writer` | Bab 4 + Bab 5 | 8-12 hours/chapter |

---

## 📋 Skill Usage Examples

### Example 1: Database Audit (Week 2-3)

**Invoke:** `database-fyp`

**Prompt:**
```
@database-fyp Audit my Prisma schema for SOP system.
Focus on:
1. Invariants from docs/SCHEMA-CONSTRAINTS.md
2. DetailSOP status machine
3. Concurrent operations (SELECT FOR UPDATE)
4. Index strategy for 20 tables
```

**Expected Output:** 2-3 hours
- Invariant table (8 invariants)
- State machine diagram
- Concurrency patterns (3 operations)
- Index SQL (5 indexes)
- Prisma patterns (3 patterns)

---

### Example 2: API Implementation (Week 4-5)

**Invoke:** `backend-fyp` + `api-contract-designer`

**Prompt:**
```
@api-contract-designer Design API spec for SOP module.
Endpoints needed:
- POST /api/v1/sop (create)
- GET /api/v1/sop/:id (detail)
- PATCH /api/v1/sop/:id/status (update status)
```

**Then:**
```
@backend-fyp Implement SOP module based on spec above.
Include:
- Controller (thin)
- Service (business logic)
- Repository (data access)
- DTOs (validation)
- E2E tests (critical flows)
```

**Expected Output:** 25-30 hours
- 1 hour API spec
- 20-25 hours implementation
- 3-4 hours testing

---

### Example 3: Scope Decision (Weekly)

**Invoke:** `scope-guardian`

**Prompt:**
```
@scope-guardian Stakeholder requests: "Add export PDF feature for SOP."
Should I implement this for thesis demo?
```

**Expected Output:** 30 min
- Decision: ❌ Phase 2 (post-thesis)
- Reasoning: Demo works without PDF export
- Alternative: Screenshot + print browser (Ctrl+P)

---

## 🎓 Thesis Documentation Flow

### Bab 3 (Analisis Sistem) — Week 8

**Invoke:** `system-analyst`

**Prompt:**
```
@system-analyst Generate Bab 3 documentation for SOP system.
Include:
- 3.1 Gambaran Umum Sistem
- 3.2 Identifikasi Aktor (4 roles)
- 3.3 Proses Bisnis (5 major processes)
- 3.4 Use Case Specifications (15 use cases)
- 3.5 Diagram Use Case (PlantUML)
- 3.6 Kebutuhan Fungsional (table)
- 3.7 Kebutuhan Non-Fungsional (table)
- 3.8 Analisis Gap (all gaps found)
```

**Expected Output:** 8-10 hours
- 20-30 pages of academic documentation
- PlantUML diagrams
- Gap analysis table

---

### Bab 4 (Implementasi) — Week 12

**Invoke:** `thesis-writer`

**Prompt:**
```
@thesis-writer Generate Bab 4 documentation.
Include:
- 4.1 Implementasi Sistem (environment, database, backend, frontend)
- 4.2 Pembahasan (functional achievement, constraints + solutions)
- Screenshots for key features
```

**Expected Output:** 8-12 hours
- 30-40 pages of implementation documentation
- Screenshot guidelines
- Code snippets for key invariants

---

### Bab 5 (Testing) — Week 12

**Invoke:** `thesis-writer`

**Prompt:**
```
@thesis-writer Generate Bab 5 documentation.
Include:
- 5.1 Strategi Pengujian (unit, integration, E2E)
- 5.2 Hasil Pengujian (tables with test results)
- 5.3 Analisis Hasil Pengujian (performance, security)
- 5.4 Kendala Pengujian
- 5.5 Kesimpulan Pengujian
```

**Expected Output:** 8-12 hours
- 20-30 pages of testing documentation
- Test result tables
- Coverage reports

---

## 🔥 Critical Insights

### 1. When NOT to Invoke Skills

**Don't invoke skills for:**
- ❌ Quick bug fixes (direct edit faster)
- ❌ Trivial features (CRUD without business logic)
- ❌ Refactoring existing code (already understood)
- ❌ Documentation updates (minor changes)

**Do invoke skills for:**
- ✅ New module design (SOP, Evaluasi, TTE)
- ✅ Database constraint enforcement
- ✅ Security-critical features (TTE, auth)
- ✅ Thesis documentation chapters
- ✅ Scope decisions (feature creep prevention)

---

### 2. Time Management

**Weekly Time Budget:**

| Activity | Hours/Week | Total (12 weeks) |
|----------|------------|------------------|
| Skill invocation + analysis | 4-6 hours | 48 hours |
| Implementation | 20-25 hours | 250 hours |
| Testing | 4-6 hours | 50 hours |
| Documentation | 4-6 hours | 50 hours |
| **Total** | **32-43 hours** | **~400 hours** |

**FYP Success Formula:**
```
Skill Analysis (10%) + Implementation (65%) + Testing (12%) + Documentation (13%) = Successful Thesis
```

---

### 3. Common Pitfalls

**❌ WRONG: Over-Analyzing**
```
Week 2: Run full database-audit (14 phases, 15 hours)
Week 3: Still analyzing concurrency patterns
Week 4: No implementation yet
Result: Behind schedule, panic mode
```

**✅ CORRECT: FYP-Optimized**
```
Week 2: Run database-fyp (5 phases, 2-3 hours)
Week 3: Start implementing Prisma schema
Week 4: Core APIs implemented
Result: On track, buffer time available
```

---

### 4. Success Metrics

**End of Week 6:**
- ✅ All P0 features complete (Auth, OPD, SOP Core, Prosedur)
- ✅ Database constraints enforced
- ✅ TTE security audited
- ✅ Critical flows tested

**End of Week 8:**
- ✅ All P1 features complete (Evaluasi, TTE, Audit Log)
- ✅ Bab 3 documentation complete
- ✅ Demo script drafted

**End of Week 12:**
- ✅ All critical flows work
- ✅ Bab 4 + Bab 5 complete
- ✅ Demo rehearsed (5 times)
- ✅ Backup plan ready

---

## 📊 Impact Summary

### Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Active skills | 16 | 9 | -44% |
| Analysis phases | 120+ | 25 | -79% |
| Documentation pages | 500+ | 150 | -70% |
| Time per audit | 8-15 hours | 2-4 hours | -75% |
| Risk level | High (analysis paralysis) | Low (focused implementation) | ✅ |

### Quality Maintained

| Aspect | Before | After | Notes |
|--------|--------|-------|-------|
| Database invariants | 100% covered | 100% covered | ✅ Same coverage |
| Security audit | OWASP Top 10 | TTE focus only | ✅ FYP-relevant |
| Testing strategy | 100% coverage target | 80% critical flows | ✅ Pragmatic |
| Documentation | Enterprise-grade | Thesis-focused | ✅ Academic standard |

---

## 🎯 Final Advice

> **"Your goal is not perfect skills — it's a successful thesis defense."**

**Prioritize:**
1. ✅ Working demo (5 critical flows)
2. ✅ Database correctness (invariants enforced)
3. ✅ Documentation complete (Bab 3-5)
4. ✅ Testing passed (critical flows)
5. ⚡ Nice-to-have features (only if time permits)

**Remember:**
- A completed FYP is better than a perfect abandoned FYP
- 80% coverage with working demo beats 100% coverage with no demo
- Scope discipline is your superpower (use `scope-guardian` weekly)

---

*Created: 2026-04-01 — FYP Optimization Guide*
*For questions: Reference SKILLS-INDEX.md or invoke scope-guardian*
