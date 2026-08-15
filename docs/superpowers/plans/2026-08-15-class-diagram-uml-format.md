# UML Class Diagram Format Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `docs/server-class-diagram.drawio` to use standard UML class-box and relationship notation while preserving the approved domain fields and operations.

**Architecture:** Keep the existing domain-level classes, but render each attribute and operation as an individual UML row separated by a line. Use plain associations by default, composition only for strong lifecycle ownership, multiplicity labels at connector ends, and an association class for Penilaian SOP.

**Tech Stack:** Draw.io XML, UML class diagram notation.

## Global Constraints

- Preserve approved domain fields and business operations.
- Do not reintroduce NestJS, Prisma, repository, controller, service, DTO, or persistence-level classes.
- Class boxes use a compact swimlane header, one row per attribute/operation, and a separator line.
- Association uses a plain solid connector unless navigability is materially relevant.
- Composition uses a filled diamond only for strong lifecycle ownership.
- Multiplicity is represented by edge labels at each relationship endpoint, not inline `(1 : 0..*)` text.
- Do not invent inheritance/generalization where the domain model only uses roles or attributes.
- Final diff must contain only `docs/server-class-diagram.drawio`.

---

### Task 1: Reformat UML classes and relationships

**Files:**
- Modify: `docs/server-class-diagram.drawio`

**Interfaces:**
- Consumes: approved domain classes and fields already present in the diagram.
- Produces: standard UML-style class boxes and semantically correct connectors.

- [ ] Convert each class to compact UML layout: class header, one row per attribute, separator line, one row per operation.
- [ ] Keep attributes private (`-`) and business operations public (`+`).
- [ ] Replace inline multiplicity text with endpoint `edgeLabel` cells.
- [ ] Use composition for `Dokumen SOP`–`Langkah SOP`, `Pengajuan Evaluasi`–`Berita Acara Evaluasi`, `Dokumen SOP`–`Pengesahan SOP`, and `Pengajuan Evaluasi`–`Pengingat Proses`.
- [ ] Use plain associations for OPD/user/SOP/pelaksana/peraturan/signature relationships.
- [ ] Model `Penilaian SOP` as an association class attached to the `Pengajuan Evaluasi`–`Dokumen SOP` association.
- [ ] Verify valid Draw.io XML and scan out custom inline cardinality syntax, implementation-layer names, and unnecessary UML arrows.
