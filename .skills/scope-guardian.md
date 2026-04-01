---
name: scope-guardian
description: >
  Scope management specialist for final year project. Use this skill when: deciding what to
  build in Phase 1 vs Phase 2, preventing feature creep, or defining MVP for thesis demo.
  Triggers on: "scope creep", "feature creep", "MVP definition", "Phase 1 vs Phase 2",
  "what to build", "priority feature".
---

# Scope Guardian — FYP MVP Specialist

**Mission:** Prevent feature creep and keep FYP focused on thesis demo success.

**Time Budget:** 30 min decision-making

---

## MVP Definition

### Phase 1 (Thesis Demo — 12 weeks)

**Must Have (P0):**

| Module | Features | Why Critical |
|--------|----------|--------------|
| **Auth** | Login JWT, role guard, 1 user per role per OPD | Core access control |
| **OPD** | CRUD OPD, aggregate stats | Data master |
| **SOP Core** | Create SOP, edit metadata, status transitions | Main domain entity |
| **Prosedur** | CRUD LangkahSOP, diagram rendering | Flowchart requirement |
| **Evaluasi** | Create pengajuan, assign evaluator, submit nilai | Evaluation workflow |
| **TTE** | Register TTE, PIN sign, RiwayatTandaTangan | Digital signature |
| **Database** | 20 tables, constraints, indexes | Data integrity |

**Total P0 Features:** 7 modules, ~40 endpoints

**Should Have (P1):**

| Module | Features | Why Important |
|--------|----------|---------------|
| **Peraturan** | CRUD Peraturan, dasar hukum linkage | SOP requires dasar hukum |
| **Tim** | CRUD AnggotaTimPenyusun, AnggotaTimEvaluasi | Team management |
| **Audit Log** | LogEditSOP, LogNilaiEvaluasi | Traceability requirement |
| **Dashboard** | Stats per role, pending tasks | UX for demo |

**Total P1 Features:** 4 modules, ~20 endpoints

**Could Have (P2 — If Time Permits):**

| Module | Features | Nice to Have |
|--------|----------|--------------|
| **Notifikasi** | In-app notification (SSE) | Real-time updates |
| **Export PDF** | Export SOP to PDF | User convenience |
| **Rekap Evaluasi** | Annual evaluation report | Reporting feature |
| **Search** | Full-text search SOP | Better UX |

**Total P2 Features:** 4 modules, ~10 endpoints

**Won't Have (Phase 2):**

| Feature | Why Deferred |
|---------|--------------|
| Mobile app | Web-first, mobile is phase 2 |
| Multi-tenant (multi-kota) | v1.0 fokus satu instansi |
| Real-time chat | Belum dibutuhkan, tambah kompleksitas |
| Versioning SOP (branching) | Terlalu kompleks untuk v1 |
| Workflow approval custom | Alur sudah fix sesuai regulasi |

---

## Decision Matrix

### When to Say NO to New Feature

```
DECISION TREE:

User/Stakeholder: "Can we add [feature X]?"

Ask:
1. Is this required for thesis demo?
   - YES → P0 (must have)
   - NO → Continue

2. Does this prevent demo from working?
   - YES → P0 (must have)
   - NO → Continue

3. Is this in REQUIREMENTS.md v1.0?
   - YES → P1 (should have)
   - NO → Continue

4. Can demo succeed without this?
   - YES → P2 (if time permits) or Phase 2
   - NO → P1 (should have)

5. Will this take > 1 week to implement?
   - YES → Phase 2 (post-thesis)
   - NO → P2 (if time permits)
```

### Example Decisions

| Feature Request | Decision | Reasoning |
|-----------------|----------|-----------|
| "Add mobile app" | ❌ Phase 2 | Not required for demo, >1 week effort |
| "Add export PDF" | ⚠️ P2 | Nice to have, but demo works without |
| "Add notifikasi real-time" | ⚠️ P2 | Complex, demo works with manual refresh |
| "Fix status transition bug" | ✅ P0 | Prevents demo from working |
| "Add dark mode" | ❌ Phase 2 | Cosmetic, not functional |
| "Add multi-language" | ❌ Phase 2 | Out of scope for v1.0 |

---

## Weekly Scope Check

**Every Friday, ask:**

```
WEEKLY SCOPE CHECK (Week [X] of 12)

Completed This Week:
- [ ] [Task 1]
- [ ] [Task 2]

Planned Next Week:
- [ ] [Task 1]
- [ ] [Task 2]

Scope Creep Detected?
- [ ] Any P2 features started?
- [ ] Any new features added mid-week?
- [ ] Any "quick fixes" that took >4 hours?

On Track for Demo?
- [ ] All P0 features complete?
- [ ] P1 features ≥ 50% complete?
- [ ] Buffer time remaining (Week 11-12)?

Action Items:
- [ ] Stop working on: [P2 feature]
- [ ] Start working on: [P0/P1 feature]
- [ ] Move to Phase 2: [feature]
```

---

## Phase 2 Backlog

**Features Deferred to Phase 2 (Post-Thesis):**

```
PHASE 2 BACKLOG (Post-Thesis)

Priority A (Implement within 3 months):
- Export PDF (SOP, BA, Rekap)
- Notifikasi in-app (SSE)
- Search SOP (full-text)

Priority B (Implement within 6 months):
- Mobile app (React Native)
- Multi-tenant support
- Advanced reporting

Priority C (Future consideration):
- AI-assisted SOP drafting
- Workflow customization
- Integration with e-government systems
```

---

## Output Contract

Generate scope decision in this format:

```markdown
===========================================
SCOPE DECISION
===========================================
Feature Request: [feature name]
Requested By: [stakeholder]
Date: [date]

---
ANALYSIS
---
Required for demo: YES / NO
Prevents demo without: YES / NO
In REQUIREMENTS.md v1.0: YES / NO
Effort estimate: [X days/weeks]

---
DECISION
---
Priority: P0 / P1 / P2 / Phase 2
Reasoning: [2-3 sentences]

---
ALTERNATIVES
---
If P2/Phase 2: [simpler alternative for demo]

===========================================
DECISION FINAL: YES / NO
Stakeholder Agreed: YES / NO
===========================================
```

---

*Created: 2026-04-01 — FYP-specific skill for scope management*
