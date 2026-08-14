---
name: creating-project-diagrams
description: Use when creating or updating SOPFlow architecture, activity, sequence, ERD, or class diagrams and when diagram output must stay consistent with the existing repository documentation.
---

# Creating Project Diagrams

## Core rule

Existing repository diagrams are the visual and structural contract. Preserve their grammar; update semantics from the current codebase and canonical docs. Never introduce a new notation, theme, abstraction level, or component merely because it looks cleaner.

## Golden references

| Diagram | Canonical format/reference |
| --- | --- |
| Architecture | `docs/arsitektur-sistem.md` |
| Activity | `docs/activity-diagram/*.md`, especially `evaluator-mengevaluasi-sop.md` |
| Sequence | `docs/sequence/*.md`, especially `evaluator-mengevaluasi-sop.md` |
| ERD | `docs/server-prisma-erd.drawio` |
| Class | `docs/server-class-diagram.drawio` |

Before editing a diagram, read its nearest golden reference plus the relevant `docs/usecase.md`, `docs/usecase-scenario/`, `docs/requirements.md`, and implementation source. Database truth comes from the current Prisma schema/migrations.

## Shared conventions

- Use Indonesian for business actions, labels, titles, and explanations. Keep code identifiers, enum names, types, ports, and protocol names exact.
- Preserve existing filenames and layout. New Markdown diagram files use kebab-case and the same actor/use-case naming pattern as neighboring files.
- Diagram content must describe implemented/current behavior. Clearly mark optional/external or future components; never present legacy or planned components as active.
- Prefer traceability over decoration. Do not add colors, gradients, shadows, icons, rounded cards, or another diagram language.
- Change only relevant nodes/edges. For Draw.io, preserve coordinates and existing styles where possible instead of regenerating the entire XML.

## Activity diagrams

Use Markdown + PlantUML. Match this document shape exactly: H1 `Diagram Aktivitas: <Aktor> - <Use Case>`, source-use-case line, `## Metadata`, four-row metadata table (`Use case`, `Aktor utama`, `Nomor kebutuhan fungsional`, `Tujuan`), then `## PlantUML`.

Inside PlantUML: use `title`, actor/system swimlanes (`|Aktor|`, `|Sistem|`), `start`/`stop`, verb-led activity text, and explicit `if ... then (Ya) ... else (Tidak) ... endif`. Show business decisions and system responsibilities, not controller/service/API call choreography.

## Sequence diagrams

Use Markdown + PlantUML with the same header/source/metadata structure as activity diagrams. Start PlantUML with `title`, `autonumber`, and `autoactivate on`.

Use the existing abstraction roles: `actor`, `boundary`, `control`, and domain `entity`. Messages describe business/system interactions in Indonesian. Use `alt` for mutually exclusive outcomes and `opt` for optional flows. Keep persistence/domain objects conceptual; do not leak arbitrary NestJS implementation classes into the diagram unless the existing diagram family already models them.

## Architecture diagrams

Follow `docs/arsitektur-sistem.md`: concise top-down `text` diagrams for runtime flow, then prose sections for responsibilities and boundaries. Show public ingress separately from internal service ports. Represent only currently deployed services/storage/integrations, and label optional external dependencies explicitly. Do not resurrect PostgreSQL, S3/MinIO, Evolution API, HSM/KMS, OCSP/TSA, or PSrE/BSrE as active unless the implementation has actually changed.

## ERD

Maintain Draw.io XML compatible with `docs/server-prisma-erd.drawio`. Source entities, fields, nullability, uniqueness, PK/FK, types, and relations from Prisma/migrations.

Keep the established table grammar: square boxes (`rounded=0`), white fill, black stroke/text, HTML table layout, three logical columns for key marker / field / DB type, and explicit `PK`/`FK` markers. Preserve orthogonal relationship edges and cardinality semantics. Do not derive ERD structure from DTOs or UI models.

## Class diagram

Maintain Draw.io XML compatible with `docs/server-class-diagram.drawio`. Preserve section grouping (`REPOSITORY CLASSES`, `ENTITY CLASSES (PRISMA MODELS)`, `ENUM CLASSES`), monochrome white/black styling, square swimlane-style class boxes, roughly 16px class/body text and 18px bold section headings.

Use the existing UML text grammar: stereotypes such as `<<repository>>` / `<<entity>>`, `-` for attributes, `+` for operations, and explicit `<<PK>>` / `<<FK ...>>` markers where applicable. Preserve orthogonal connectors and avoid adding unrelated layers merely to make the diagram more comprehensive.

## Verification before finishing

Confirm all of the following:

1. Diagram facts match current code/schema and canonical business docs.
2. Use-case ID, actor, requirement number, and terminology remain traceable and are not treated as 1:1 when the docs say otherwise.
3. PlantUML files follow neighboring document structure and compile syntactically.
4. Draw.io files retain valid `mxfile`/`mxGraphModel` structure and existing visual grammar.
5. No stale, speculative, or invented component/entity/flow was added.
6. The diff is minimal: semantic update, not gratuitous diagram restyling or wholesale regeneration.
