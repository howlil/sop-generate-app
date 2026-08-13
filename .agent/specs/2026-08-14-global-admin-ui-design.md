# Global Admin UI Refresh — Design Specification

Date: 2026-08-14
Status: Approved design, pending implementation plan
Scope: `client/` only
Reference direction: neutral, compact admin dashboard inspired by the supplied MyPaaS project inventory screenshot

## 1. Context

The SOP application already has shared UI primitives and centralized shell styling, but the visual language is still inconsistent across tables, controls, cards, and page layouts. The requested change is a global visual refresh rather than a one-page reskin.

The implementation must make data-heavy SOP screens feel like one coherent administrative product: neutral surfaces, thin borders, compact typography, restrained radius, low visual noise, and consistent spacing. Blue remains the application accent, but it should be used selectively for interaction and state rather than as a dominant surface color.

## 2. Goals

1. Apply one consistent visual language to all dashboard pages and table-based workflows.
2. Make tables the primary information surface instead of placing them inside visually heavy cards.
3. Standardize typography, spacing, border, radius, color, shadow, and control sizing globally.
4. Preserve existing business behavior, routing, permissions, API calls, state management, and SOP workflows.
5. Preserve responsive and accessible behavior while increasing desktop information density.
6. Implement the refresh through shared tokens and primitives first so future screens inherit the system automatically.

## 3. Non-goals

- No backend or database changes.
- No API contract changes.
- No workflow, validation, authorization, or domain-logic changes.
- No redesign of generated SOP/PDF document content.
- No introduction of a new component framework or design-system dependency.
- No broad refactor unrelated to the visual refresh.

## 4. Chosen Approach

Use a token-first global refresh followed by shared primitive and shell updates.

Order of responsibility:

1. Global design tokens and typography.
2. Shared surface, table, pagination, button, input, badge, and related primitives.
3. Dashboard shell: sidebar, header, page gutter, responsive navigation.
4. Targeted page cleanup only where local classes override the shared system.
5. Regression tests for shared primitives and shell behavior.

This approach is preferred over per-page styling because it minimizes duplication and makes the result durable.

## 5. Visual Foundation

### 5.1 Color roles

Use a neutral administrative palette:

- App background: very light neutral gray.
- Primary surface: white.
- Subtle surface: neutral gray for hover, search backgrounds, secondary grouping, and low-emphasis states.
- Border: light neutral gray with sufficient separation from white.
- Primary text: dark slate/near-black.
- Secondary text: medium slate.
- Muted text: lighter slate but still readable.
- Primary accent: existing application blue, reserved for links, focus, selected/active navigation, primary actions, and informational states.
- Success/warning/danger colors remain semantic and should not be replaced with blue.

Avoid large blue-filled table headers, card backgrounds, or decorative gradients.

### 5.2 Shape

Global shape hierarchy:

- Controls: 6px radius.
- Cards/table surfaces: 8px radius.
- Popovers/dialogs/overlays: 10–12px radius where needed.
- Avoid pill shapes except for true pills such as status badges or compact tags.

### 5.3 Shadows

- Cards and table surfaces: no default shadow.
- Inputs/buttons: no decorative shadow.
- Dropdowns, popovers, dialogs, and mobile drawer overlays may retain functional elevation.
- Separation should come primarily from border, whitespace, and background contrast.

### 5.4 Typography

Keep Inter as the main UI family and use a compact productive scale:

- Page title: 18px, 600 weight, approximately 24px line height.
- Section title: 16px, 600 weight, approximately 22px line height.
- Body/control text: 14px, 400–500 weight, approximately 20px line height.
- Table body: 13px, 400–500 weight, approximately 18px line height.
- Table header/metadata label: 12px, 500 weight, approximately 16px line height.

Use 700 sparingly. Hierarchy should come from size, spacing, and weight rather than excessive bold text.

### 5.5 Spacing

Desktop defaults:

- Main page gutter: 20–24px.
- Standard section gap: 20–24px.
- Card/internal surface padding: 16–20px.
- Toolbar gap: 8–12px.
- Table cell horizontal padding: approximately 12px.
- Table cell vertical padding: approximately 10px, with exceptions for dense metadata rows.
- Standard desktop control height: approximately 36–40px depending on control role.

Spacing should remain token-driven or primitive-driven rather than repeated as arbitrary local values.

## 6. Table System

The global `data-table` primitive becomes the source of truth for standard data tables.

### 6.1 Surface

- White background.
- 1px neutral border.
- 8px radius.
- No default shadow.
- Horizontal overflow remains supported.
- Focus state for the scroll region remains keyboard accessible.

### 6.2 Header

- White or very light neutral-gray background.
- No blue-filled background by default.
- 12px medium text.
- Secondary foreground color.
- Thin bottom border.
- Sticky header behavior remains where already supported.

### 6.3 Body rows

- 13px body text.
- Thin row separators.
- No zebra striping by default.
- Hover uses a subtle neutral surface.
- `focus-within` remains visually discoverable without flooding the row with strong blue.
- Vertical alignment should remain predictable across icon, badge, and text cells.

### 6.4 Action column

- Keep action columns narrow and `whitespace-nowrap`.
- Icon-only actions should use shared icon-button sizing and accessible labels.
- Destructive actions use semantic danger styling, not primary blue.

### 6.5 Empty/loading/error states

- Keep states inside the table/surface boundary when the page is table-centric.
- Empty-state typography should use the same neutral hierarchy.
- Do not introduce oversized illustration cards for routine empty states.

## 7. Pagination

Pagination should visually match the compact project-inventory reference while preserving existing behavior.

Desktop:

- Item range/count on the left.
- Navigation on the right.
- Prefer `Previous | Page N | Next` for the default table pagination presentation.
- Outline-neutral controls, approximately 34–36px high.
- Disabled states remain obvious through contrast and cursor/interaction behavior.

Mobile:

- Stack/wrap cleanly when space is limited.
- Maintain adequate touch targets.
- Expose current page and total pages textually.

Do not remove pagination functionality or alter page-size semantics as part of this visual task.

## 8. Search, Filter, and Table Toolbar

- Search input: white surface, thin border, no shadow, approximately 40px height.
- Search icon: muted neutral.
- Placeholder: muted neutral with sufficient contrast.
- Filters and secondary actions use shared outline/ghost treatments.
- Desktop toolbars align horizontally with compact spacing.
- Toolbars wrap rather than overflow on smaller screens.
- Avoid unnecessary framed containers around a toolbar when the table surface already provides grouping.

## 9. Dashboard Shell

### 9.1 Sidebar

Expanded desktop sidebar:

- Width approximately 240–256px.
- White surface with right border.
- Navigation rows approximately 40px minimum height.
- Active state: subtle neutral/blue tint with stronger text/icon, not a saturated block.
- Inactive hover: neutral muted surface.
- Icons approximately 18px with consistent stroke weight.

Collapsed desktop rail:

- Keep approximately 56px width.
- Maintain tooltips/accessibility for icon-only navigation.

Mobile:

- Keep drawer behavior rather than squeezing desktop navigation into the content area.
- Overlay/elevation remains functional for the drawer only.

### 9.2 Top header

- White surface.
- Bottom border.
- No decorative surface shadow.
- Height approximately 56px.
- Controls use the same 36–40px sizing/radius rules as the rest of the UI.

### 9.3 Main content

- Very light neutral app background.
- Full available content width with 20–24px desktop gutter.
- Do not wrap an entire page inside a redundant card.
- Page header/action rows should be compact and visually aligned with table toolbars.

## 10. Cards and Other Surfaces

Cards remain available for real grouping, metrics, forms, and summary information.

Default card treatment:

- White surface.
- 1px neutral border.
- 8px radius.
- No default shadow.
- 16–20px internal padding.

Avoid nesting multiple bordered cards when spacing or a section divider can express the hierarchy more clearly.

## 11. Buttons, Inputs, Selects, and Badges

### Buttons

- Standard radius: 6px.
- No decorative shadow.
- Primary action may remain solid blue.
- Secondary/outline actions use neutral borders and surfaces.
- Ghost actions should remain visually quiet.
- Icon-only buttons use consistent square sizing.

### Inputs/selects

- Thin neutral border.
- White default surface.
- 6px radius.
- 14px text.
- Clear blue focus ring/focus border.
- No thick shadow-based focus treatment.

### Status badges

- Use semantic status colors.
- Compact padding and typography.
- Prefer subtle tinted backgrounds with readable semantic foregrounds.
- Do not make every metadata value a pill.

## 12. Responsive Behavior

The global refresh must not reduce mobile usability.

- Sidebar becomes a drawer below the desktop breakpoint.
- Tables remain horizontally scrollable where column reduction is not appropriate.
- Toolbars wrap.
- Pagination stacks when necessary.
- Touch targets remain practical even though desktop density increases.
- No intentionally microscopic text; the existing minimum-readable-text guard remains respected.

## 13. Accessibility

Preserve or improve:

- Visible `focus-visible` states.
- Keyboard access to horizontally scrollable table regions.
- `aria-current` for active navigation and pagination.
- Accessible labels for icon-only controls.
- Semantic table elements and column headers.
- Sufficient foreground/background contrast.
- Reduced-motion behavior.

The visual simplification must not remove interaction affordances.

## 14. Expected Implementation Touchpoints

Primary shared files likely to change:

- `client/src/styles.css`
- `client/src/components/ui/data-table.tsx`
- `client/src/components/ui/pagination.tsx`
- `client/src/components/ui/card.tsx`
- shared button/input/select/badge primitives where their defaults conflict with the new system
- `client/src/components/layout/AppSidebar.tsx`
- `client/src/components/layout/DashboardLayout.tsx`
- `client/src/components/layout/HeaderBar.tsx`

Targeted page files may change only when they contain local visual overrides that prevent the global primitives from taking effect.

## 15. Testing Strategy

Follow the repository's TDD preference for behavioral/shared-component changes.

Required checks:

1. Add/update regression tests for table surface, header, row, and accessibility behavior.
2. Add/update pagination tests for desktop/mobile presentation while preserving pagination semantics.
3. Add/update shell tests for expanded/collapsed sidebar and responsive navigation.
4. Update primitive tests for changed default card/button/input classes where applicable.
5. Run client typecheck.
6. Run client unit/component tests.
7. Run lint/format checks required by the repository.
8. Run production client build.
9. Run existing mandatory repository CI before merge.

Visual-only class assertions should focus on stable design roles rather than brittle exhaustive class snapshots.

## 16. Git and Delivery Strategy

- One working branch for this task: `refactor/global-admin-ui`.
- Do not create follow-up branches for small fixes within this task.
- Intermediate commits are allowed when useful for TDD, but final integration should use squash merge so `main` receives one clean task commit.
- Do not merge until mandatory checks are green and no blocker remains.
- Delete the task branch after successful merge when tooling permits.

## 17. Acceptance Criteria

The task is complete when:

1. Standard dashboard tables across roles inherit the same neutral compact table styling without per-page duplication.
2. Table headers are neutral rather than prominently blue-filled.
3. Table surfaces and standard cards rely on border rather than default shadow.
4. Global typography follows the 18/16/14/13/12 productive scale or equivalent semantic tokens.
5. Sidebar, header, page gutter, and control spacing visually belong to the same system.
6. Expanded desktop sidebar is approximately 240–256px while the collapsed rail remains approximately 56px.
7. Pagination uses a compact neutral presentation aligned with the supplied reference direction.
8. Search/filter controls have consistent neutral borders, radius, height, and typography.
9. Existing business logic and workflows remain unchanged.
10. Desktop and mobile navigation remain usable and accessible.
11. Existing tests are updated intentionally rather than disabled to accommodate the redesign.
12. Typecheck, tests, lint/format checks, production build, and mandatory CI pass before merge.
