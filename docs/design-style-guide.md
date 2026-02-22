# Design Style Guide - Compact Modern Dashboard

> **Design Philosophy**: Ultra-compact, clean, and minimal design system with subtle shadows, tight spacing, and efficient use of screen real estate. Optimized for productivity and information density.

---

## 📐 Layout System

### Core Layout Principles
- **Information Density**: Maximize content visibility while maintaining readability
- **Compact Spacing**: Use minimal margins and padding
- **Efficient Hierarchy**: Clear visual organization without excessive whitespace
- **Responsive Constraints**: Prioritize desktop-first, mobile-aware

### Layout Dimensions

#### Sidebar
```css
width: 56px (3.5rem / 14 in Tailwind)
background: white
border-right: 1px solid #E5E7EB (gray-200)
```

**Characteristics:**
- Ultra-thin vertical navigation
- Icon-only with tooltips on hover
- Fixed position
- Logo: 36px × 36px (w-9 h-9)
- Icon buttons: 40px × 40px (w-10 h-10)
- Icon size: 20px (w-5 h-5)
- Gap between items: 4px (gap-1)

#### Header Bar
```css
height: 48px-56px (h-12 to h-14)
padding: 0 24px (px-6) or 0 16px (px-4)
background: white
border-bottom: 1px solid #E5E7EB (gray-200)
```

**Elements:**
- Title: `text-sm` (14px)
- Tabs: `h-7` (28px) with `px-3`, `text-xs`
- Buttons: `h-7` or `h-8` (28px or 32px)
- Icon size in buttons: `w-3.5 h-3.5` (14px)

#### Content Container
```css
padding: 16px-24px (p-4 to p-6)
background: #F9FAFB (gray-50) or white
overflow: auto (scrollable content)
```

#### Cards & Panels
```css
border-radius: 8px (rounded-lg)
border: 1px solid #E5E7EB (gray-200)
padding: 16px (p-4)
background: white
shadow: subtle (none by default, hover:shadow-md)
```

---

## 🎨 Color System

### Neutral Palette
```css
/* Base Colors */
--gray-50:  #F9FAFB   /* Background, subtle fills */
--gray-100: #F3F4F6   /* Hover states, disabled */
--gray-200: #E5E7EB   /* Borders, dividers */
--gray-300: #D1D5DB   /* Placeholder text */
--gray-400: #9CA3AF   /* Icons, secondary text */
--gray-500: #6B7280   /* Body text, labels */
--gray-600: #4B5563   /* Primary icons */
--gray-700: #374151   /* Headings, emphasized text */
--gray-900: #111827   /* High emphasis text */
--white:    #FFFFFF   /* Backgrounds, cards */
--black:    #000000   /* Overlays (with opacity) */
```

### Semantic Colors

#### Primary (Blue)
```css
--blue-50:  #EFF6FF   /* Backgrounds, subtle highlights */
--blue-100: #DBEAFE   /* Hover backgrounds */
--blue-200: #BFDBFE   /* Borders */
--blue-300: #93C5FD   /* Active borders */
--blue-500: #3B82F6   /* Primary actions, links */
--blue-600: #2563EB   /* Primary hover */
--blue-700: #1D4ED8   /* Primary pressed */
```

**Usage:**
- Primary buttons: `bg-blue-500 hover:bg-blue-600`
- Active tabs: `bg-blue-50 text-blue-600`
- Links: `text-blue-600 hover:underline`
- Selected states: `border-blue-500`

#### Success (Green)
```css
--green-100: #D1FAE5  /* Success backgrounds */
--green-600: #059669  /* Success icons */
--green-700: #047857  /* Success text */
```

**Usage:**
- Approved status: `bg-green-100 text-green-700`
- Success messages
- Positive metrics: `text-green-600`

#### Warning (Orange/Yellow)
```css
--orange-100: #FED7AA /* Warning backgrounds */
--orange-700: #C2410C /* Warning text */
--yellow-100: #FEF3C7 /* Alert backgrounds */
--yellow-400: #FBBF24 /* Stars, ratings */
```

**Usage:**
- Pending status: `bg-orange-100 text-orange-700`
- Draft badges: `bg-yellow-100 text-yellow-700`

#### Error (Red)
```css
--red-50:  #FEF2F2   /* Error backgrounds */
--red-100: #FEE2E2   /* Error badges */
--red-600: #DC2626   /* Error icons */
--red-700: #B91C1C   /* Error text */
```

**Usage:**
- Error states: `bg-red-100 text-red-700`
- Delete buttons: `hover:bg-red-50 text-red-600`

#### Accent (Purple)
```css
--purple-100: #F3E8FF /* AI feature backgrounds */
--purple-600: #9333EA  /* AI feature icons */
--purple-700: #7E22CE  /* AI feature text */
```

**Usage:**
- AI-related features: `bg-purple-50 text-purple-700`
- AI suggestions: `bg-purple-100 border-purple-200`

---

## 📝 Typography System

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Type Scale

#### Headings
```css
/* Page Title (Rare) */
.heading-lg {
  font-size: 18px;      /* text-lg */
  font-weight: 600;     /* font-semibold */
  color: #111827;       /* text-gray-900 */
  line-height: 1.5;
}

/* Section Title */
.heading-base {
  font-size: 14px;      /* text-sm */
  font-weight: 600;     /* font-semibold */
  color: #111827;       /* text-gray-900 */
  line-height: 1.5;
}

/* Card Title */
.heading-sm {
  font-size: 12px;      /* text-xs */
  font-weight: 600;     /* font-semibold */
  color: #111827;       /* text-gray-900 */
  line-height: 1.5;
}
```

#### Body Text
```css
/* Primary Body (Default) */
.text-base {
  font-size: 12px;      /* text-xs */
  font-weight: 400;     /* font-normal */
  color: #374151;       /* text-gray-700 */
  line-height: 1.5;
}

/* Secondary Body */
.text-secondary {
  font-size: 12px;      /* text-xs */
  font-weight: 400;     /* font-normal */
  color: #6B7280;       /* text-gray-500 */
  line-height: 1.5;
}

/* Small Text (Captions, Metadata) */
.text-sm {
  font-size: 10px;      /* text-[10px] or custom */
  font-weight: 400;     /* font-normal */
  color: #9CA3AF;       /* text-gray-400 */
  line-height: 1.4;
}
```

#### Interactive Text
```css
/* Labels */
.label {
  font-size: 12px;      /* text-xs */
  font-weight: 500;     /* font-medium */
  color: #374151;       /* text-gray-700 */
  margin-bottom: 4px;   /* mb-1 */
}

/* Buttons */
.button-text {
  font-size: 12px;      /* text-xs */
  font-weight: 500;     /* font-medium */
  letter-spacing: 0.01em;
}

/* Links */
.link {
  font-size: 12px;      /* text-xs */
  color: #2563EB;       /* text-blue-600 */
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
```

### Typography Rules
- **DO NOT** use `text-2xl`, `text-xl`, `font-bold` unless explicitly needed
- **DEFAULT** to `text-xs` (12px) for most UI elements
- **USE** `text-sm` (14px) for primary headings and important data
- **AVOID** line-height utilities unless necessary (rely on defaults)
- **MAINTAIN** consistent font-weight: 400 (normal), 500 (medium), 600 (semibold)

---

## 🔲 Spacing System

### Spacing Scale
```css
/* Tailwind Spacing (in px) */
0.5 → 2px    (gap between tight elements)
1   → 4px    (minimal gap, icon-to-text)
1.5 → 6px    (compact spacing)
2   → 8px    (default gap)
3   → 12px   (comfortable gap)
4   → 16px   (default padding)
6   → 24px   (section padding)
8   → 32px   (large spacing)
```

### Spacing Principles

#### Internal Spacing (Padding)
```css
/* Cards/Panels */
padding: 16px;           /* p-4 (default) */

/* Compact Cards */
padding: 12px;           /* p-3 */

/* Buttons */
padding: 6px 12px;       /* py-1.5 px-3 (small) */
padding: 8px 12px;       /* py-2 px-3 (medium) */

/* Input Fields */
padding: 6px 12px;       /* py-1.5 px-3 */
height: 28px-36px;       /* h-7 to h-9 */

/* Tabs */
padding: 6px 12px;       /* py-1.5 px-3 */
height: 28px;            /* h-7 */
```

#### External Spacing (Margins & Gaps)
```css
/* Between Sections */
gap: 16px;               /* gap-4 (default) */
margin-bottom: 16px;     /* mb-4 */

/* Between Cards */
gap: 12px;               /* gap-3 (compact) */

/* Between Form Fields */
gap: 12px;               /* gap-3 */

/* Between Inline Elements */
gap: 8px;                /* gap-2 (default) */
gap: 4px;                /* gap-1 (tight, e.g., tabs) */

/* Icon to Text */
gap: 4px-8px;            /* gap-1 to gap-2 */
```

#### Grid Layouts
```css
/* Card Grids */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 16px;               /* gap-4 */

/* Stats Cards */
grid-template-columns: repeat(4, 1fr);
gap: 16px;               /* gap-4 */

/* Two Column Layout */
grid-template-columns: repeat(2, 1fr);
gap: 16px;               /* gap-4 */
```

---

## 🎛️ Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs flex items-center gap-1.5 transition-all">
  <Icon className="w-3.5 h-3.5" />
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="h-8 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-xs flex items-center gap-1.5 transition-all">
  <Icon className="w-3.5 h-3.5" />
  Button Text
</button>
```

#### Icon Button
```tsx
<button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-all">
  <Icon className="w-4 h-4 text-gray-600" />
</button>
```

#### Destructive Button
```tsx
<button className="h-8 px-3 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs">
  Delete
</button>
```

### Badges

#### Status Badges
```tsx
{/* Success */}
<Badge className="h-4 px-1.5 text-xs bg-green-100 text-green-700 border-0">
  Active
</Badge>

{/* Warning */}
<Badge className="h-4 px-1.5 text-xs bg-orange-100 text-orange-700 border-0">
  Pending
</Badge>

{/* Error */}
<Badge className="h-4 px-1.5 text-xs bg-red-100 text-red-700 border-0">
  Failed
</Badge>

{/* Info */}
<Badge className="h-4 px-1.5 text-xs bg-blue-100 text-blue-700 border-0">
  Info
</Badge>

{/* Neutral */}
<Badge className="h-4 px-1.5 text-xs bg-gray-100 text-gray-700 border-0">
  Draft
</Badge>
```

### Input Fields

#### Text Input
```tsx
<input
  type="text"
  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
  placeholder="Enter text..."
/>
```

#### Textarea
```tsx
<textarea
  className="w-full h-24 p-3 text-xs border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
  placeholder="Enter description..."
/>
```

#### Select Dropdown
```tsx
<select className="w-full h-9 px-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
  <input
    type="text"
    className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
    placeholder="Search..."
  />
</div>
```

### Tabs

#### Horizontal Tabs (Compact)
```tsx
<div className="flex gap-1">
  <button className="px-3 h-7 rounded-md text-xs transition-all bg-blue-50 text-blue-600">
    Active Tab
  </button>
  <button className="px-3 h-7 rounded-md text-xs transition-all text-gray-600 hover:bg-gray-50">
    Inactive Tab
  </button>
</div>
```

### Cards

#### Basic Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <h3 className="text-xs text-gray-700 mb-2">Card Title</h3>
  <p className="text-xs text-gray-600">Card content goes here...</p>
</div>
```

#### Stats Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex items-center gap-2 mb-2">
    <Icon className="w-4 h-4 text-blue-600" />
    <h3 className="text-xs text-gray-700">Metric Label</h3>
  </div>
  <p className="text-xl text-gray-900">1,234</p>
  <p className="text-xs text-green-600 mt-1">+12.5%</p>
</div>
```

#### Interactive Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
  {/* Content */}
</div>
```

### Tables

#### Compact Table
```tsx
<table className="w-full text-xs">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="text-left p-2 text-gray-700">Column 1</th>
      <th className="text-left p-2 text-gray-700">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="p-2 text-gray-900">Data 1</td>
      <td className="p-2 text-gray-600">Data 2</td>
    </tr>
  </tbody>
</table>
```

### Modals

#### Modal Structure
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
    {/* Header */}
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-sm text-gray-900">Modal Title</h2>
      <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-all">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Form fields or content */}
    </div>
    
    {/* Footer */}
    <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
      <button className="h-8 px-4 border border-gray-200 rounded-md hover:bg-gray-50 text-xs">
        Cancel
      </button>
      <button className="h-8 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 🎭 Interaction Patterns

### Hover States
```css
/* Cards */
hover:shadow-md

/* Buttons */
hover:bg-blue-600      /* Primary */
hover:bg-gray-50       /* Secondary */

/* Icon Buttons */
hover:bg-gray-100

/* Links */
hover:underline

/* Table Rows */
hover:bg-gray-50
```

### Active/Selected States
```css
/* Tabs */
bg-blue-50 text-blue-600

/* List Items */
border-blue-500 shadow-md

/* Checkboxes/Radio */
text-blue-600 border-blue-300
```

### Focus States
```css
/* Inputs */
focus:outline-none
focus:ring-1
focus:ring-blue-500

/* Buttons */
focus:ring-2
focus:ring-blue-500
focus:ring-offset-2
```

### Transitions
```css
/* Default Transition */
transition-all          /* Use for most interactive elements */

/* Specific Transitions */
transition-colors       /* Color changes only */
transition-opacity      /* Opacity changes */
transition-transform    /* Transform changes */

/* Duration */
duration-150           /* Fast (default) */
duration-200           /* Medium */
duration-300           /* Slow */
```

---

## 🎯 Visual Hierarchy

### Emphasis Levels

#### High Emphasis
- **Color**: `text-gray-900` (almost black)
- **Weight**: `font-semibold` (600)
- **Size**: `text-sm` to `text-base`
- **Use**: Primary headings, important values, critical actions

#### Medium Emphasis
- **Color**: `text-gray-700`
- **Weight**: `font-normal` (400) or `font-medium` (500)
- **Size**: `text-xs`
- **Use**: Body text, labels, most UI content

#### Low Emphasis
- **Color**: `text-gray-500` to `text-gray-400`
- **Weight**: `font-normal` (400)
- **Size**: `text-xs`
- **Use**: Secondary text, metadata, timestamps

#### Disabled State
- **Color**: `text-gray-400`
- **Background**: `bg-gray-100`
- **Cursor**: `cursor-not-allowed`
- **Opacity**: `opacity-50` (optional)

### Color Hierarchy for Status

```css
/* Priority Order (Descending) */
1. Red (Error, Critical)        → bg-red-100 text-red-700
2. Orange (Warning, Pending)    → bg-orange-100 text-orange-700
3. Blue (Info, Active)          → bg-blue-100 text-blue-700
4. Green (Success, Approved)    → bg-green-100 text-green-700
5. Purple (Special, AI)         → bg-purple-100 text-purple-700
6. Gray (Neutral, Default)      → bg-gray-100 text-gray-700
```

---

## 📱 Responsive Patterns

### Breakpoints (Tailwind Default)
```css
sm:  640px   /* Small devices */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Grid Responsiveness
```tsx
{/* Stats Cards - Responsive */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Cards */}
</div>

{/* Content Cards - Auto-fit */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

{/* List/Detail View */}
<div className="flex flex-col lg:flex-row gap-4">
  <div className="flex-1">{/* List */}</div>
  <div className="lg:w-96">{/* Detail */}</div>
</div>
```

---

## 🔍 Accessibility Guidelines

### Color Contrast
- **Text on White**: Minimum AA contrast ratio (4.5:1)
- **Use**: `text-gray-700` or darker for body text
- **Avoid**: `text-gray-400` for primary content

### Focus Indicators
```css
/* Always include visible focus states */
focus:ring-1 focus:ring-blue-500
focus:outline-none

/* Keyboard Navigation */
- Ensure all interactive elements are focusable
- Use logical tab order
```

### Icon Accessibility
```tsx
{/* Always pair icons with text or aria-label */}
<button aria-label="Delete item">
  <Trash2 className="w-4 h-4" />
</button>

{/* Or include sr-only text */}
<button>
  <Trash2 className="w-4 h-4" />
  <span className="sr-only">Delete</span>
</button>
```

### Size Targets
- **Minimum Touch Target**: 44px × 44px (mobile)
- **Desktop Buttons**: 32px-40px height is acceptable
- **Icon Buttons**: 32px × 32px minimum

---

## 🎨 Design Tokens Reference

### Border Radius
```css
rounded-sm:   2px   /* Subtle rounding */
rounded:      4px   /* Default */
rounded-md:   6px   /* Cards, inputs */
rounded-lg:   8px   /* Panels, modals */
rounded-xl:   12px  /* Large containers */
rounded-2xl:  16px  /* Special cases */
rounded-full: 9999px /* Circles, pills */
```

### Shadows
```css
/* Subtle (Default for elevated elements) */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Medium (Hover states) */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Large (Modals, popovers) */
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

/* Usage */
.card {
  /* No shadow by default */
}
.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* shadow-md */
}
```

### Z-Index Scale
```css
z-0:   0     /* Default */
z-10:  10    /* Dropdowns */
z-20:  20    /* Sticky headers */
z-30:  30    /* Tooltips */
z-40:  40    /* Modal overlays */
z-50:  50    /* Modals, popovers */
```

### Opacity Scale
```css
opacity-0:   0%     /* Hidden */
opacity-50:  50%    /* Disabled, overlays */
opacity-75:  75%    /* Semi-visible */
opacity-100: 100%   /* Fully visible */
```

---

## 📋 Layout Templates

### Dashboard Layout (3-Column)
```tsx
<div className="h-screen flex">
  {/* Sidebar - Fixed */}
  <aside className="w-14 bg-white border-r border-gray-200">
    {/* Navigation */}
  </aside>
  
  {/* Main Content */}
  <div className="flex-1 flex flex-col">
    {/* Header */}
    <header className="h-14 px-6 bg-white border-b border-gray-200">
      {/* Title, Tabs, Actions */}
    </header>
    
    {/* Content Area */}
    <main className="flex-1 overflow-auto p-6 bg-gray-50">
      {/* Page Content */}
    </main>
  </div>
</div>
```

### List-Detail Layout
```tsx
<div className="h-full flex">
  {/* List/Filter Sidebar (Optional) */}
  <aside className="w-60 bg-white border-r border-gray-200">
    {/* Filters, Categories */}
  </aside>
  
  {/* Main List */}
  <div className="flex-1 flex flex-col">
    {/* Search/Actions */}
    <div className="p-4 bg-white border-b border-gray-200">
      {/* Search, Sort, Filter */}
    </div>
    
    {/* List Items */}
    <div className="flex-1 overflow-auto p-4 space-y-2">
      {/* Cards */}
    </div>
  </div>
  
  {/* Detail Panel (Conditional) */}
  {selectedItem && (
    <aside className="w-96 bg-white border-l border-gray-200">
      {/* Detail View */}
    </aside>
  )}
</div>
```

---

## ✅ Best Practices

### DO's ✓
- **DO** use `text-xs` (12px) as default font size
- **DO** use minimal spacing (`gap-2`, `gap-3`, `p-3`, `p-4`)
- **DO** maintain consistent border colors (`border-gray-200`)
- **DO** use semantic color coding for status
- **DO** include hover states for interactive elements
- **DO** use `transition-all` for smooth interactions
- **DO** keep UI compact and information-dense
- **DO** use icon + text combination for clarity
- **DO** maintain 1px borders (`border` not `border-2`)
- **DO** use `rounded-md` (6px) for most UI elements

### DON'Ts ✗
- **DON'T** use large font sizes (`text-xl`, `text-2xl`) for UI
- **DON'T** use `font-bold` (700) unless critical emphasis
- **DON'T** add excessive padding/margins
- **DON'T** use heavy shadows (stick to `shadow-md` max)
- **DON'T** use thick borders (`border-2`, `border-4`)
- **DON'T** use large border radius (`rounded-xl`, `rounded-2xl`) on small elements
- **DON'T** mix color schemes (stick to semantic colors)
- **DON'T** create custom gray colors (use Tailwind grays)
- **DON'T** use line-height utilities unless necessary
- **DON'T** add transitions to non-interactive elements

---

## 🚀 Quick Start Checklist

When building a new feature or page:

```markdown
☐ Set up layout structure (sidebar width, header height)
☐ Use `text-xs` for all UI text by default
☐ Apply `p-4` or `p-6` for main content padding
☐ Use `gap-4` for grid/flex layouts
☐ Set card height to `h-7` or `h-8` for buttons
☐ Use `border-gray-200` for all borders
☐ Apply `bg-gray-50` for page backgrounds
☐ Use `bg-white` for cards and panels
☐ Add `rounded-md` for cards and inputs
☐ Include `hover:bg-gray-50` for clickable items
☐ Add `transition-all` for interactive elements
☐ Use semantic colors for status/badges
☐ Include icons with `w-4 h-4` or `w-3.5 h-3.5`
☐ Set input height to `h-9` or `h-8`
☐ Use `focus:ring-1 focus:ring-blue-500` for inputs
```

---

## 📦 Component Library Starter

### Import Pattern
```tsx
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Badge } from './ui/badge';
```

### Common Snippets

#### Page Header
```tsx
<div className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between">
  <h1 className="text-sm text-gray-900">Page Title</h1>
  <button className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs flex items-center gap-1.5">
    <Plus className="w-3.5 h-3.5" />
    New Item
  </button>
</div>
```

#### Search Bar
```tsx
<div className="p-4 bg-white border-b border-gray-200">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
    <input
      type="text"
      placeholder="Search..."
      className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
</div>
```

#### Stats Grid
```tsx
<div className="grid grid-cols-4 gap-4">
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-blue-600" />
      <h3 className="text-xs text-gray-700">Metric</h3>
    </div>
    <p className="text-xl text-gray-900">1,234</p>
    <p className="text-xs text-green-600 mt-1">+12.5%</p>
  </div>
</div>
```

---

## 🎓 Design Philosophy Summary

### Core Principles

1. **Information First**: Maximize useful content visibility
2. **Compact by Design**: Tight spacing, small fonts, minimal chrome
3. **Subtle Elegance**: Use shadows and borders sparingly
4. **Consistent Patterns**: Reuse components and styles
5. **Fast Interactions**: Smooth transitions, instant feedback
6. **Semantic Colors**: Color conveys meaning (status, state, type)
7. **Accessible Always**: Maintain contrast, focus states, touch targets
8. **Mobile Aware**: Responsive but desktop-optimized

### Visual Characteristics

- **Clean & Minimal**: No visual clutter
- **Thin & Light**: Thin borders, light shadows
- **Compact & Dense**: Small text, tight spacing
- **White & Bright**: Light backgrounds, high contrast text
- **Blue Accent**: Primary actions use blue
- **Icon-Heavy**: Icons for quick recognition
- **Card-Based**: Content organized in cards/panels
- **Flat with Depth**: Minimal gradients, subtle shadows on interaction

---

*This design system is optimized for productivity applications, dashboards, and data-intensive interfaces where information density and clarity are paramount.*

**Version**: 1.0  
**Last Updated**: December 2024  
**Framework**: React + Tailwind CSS v4.0  
**Icon Library**: Lucide React


