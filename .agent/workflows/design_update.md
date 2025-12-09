---
description: Plan to update the app design based on design-guide-RIA.md
---

# Design Update Plan

This plan outlines the steps to update the RIA Command Center design to match the provided design guide.

## 1. Typography Setup
**Goal:** Replace default fonts with Montserrat (headings) and Source Sans 3 (body).

1.  **Action:** Add Google Fonts imports to `index.css` (or `index.html`).
    ```css
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;600&display=swap');
    ```
2.  **Action:** Update `tailwind.config.js` to extend the font family theme.
    ```javascript
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Source Sans 3"', 'sans-serif'],
          heading: ['Montserrat', 'sans-serif'],
        },
      },
    }
    ```

## 2. Color Palette Integration
**Goal:** Implement the brand specific colors: Evergreen, Light Green, Gold.

1.  **Action:** Update `tailwind.config.js` to include the custom color palette.
    ```javascript
    colors: {
      evergreen: '#006044',
      'evergreen-light': '#007a56', // Derived for hover states
      'accent-green': '#76a923',
      'accent-gold': '#af8a49',
      // Map existing semantic colors if possible, or create new tokens
      primary: '#006044',
      secondary: '#af8a49',
    }
    ```

## 3. Global Theme Updates
**Goal:** Switch from the current "slate/blue" theme to the "evergreen/gold" theme without breaking layout.

1.  **Action:** Global Find & Replace (Carefully!) or component-by-component update.
    *   Current: `bg-slate-900` (Background) -> Candidate: keep dark, but maybe slightly warmer or deep green tinted? *Note: Design guide mentions dark mode using variables. For now, we will stick to a dark theme but swap the primary accents.*
    *   Current: `text-blue-400` -> `text-accent-gold` or `text-accent-green`.
    *   Current: `bg-blue-600` (Primary interaction) -> `bg-evergreen`.
    *   Current: `border-blue-500` -> `border-accent-gold` or `border-evergreen`.

## 4. Component Specific Updates

### Header
- Update logo/brand color to `evergreen`.
- Use `Montserrat` for the "RIA COMMAND CENTER" title.

### Navigation Buttons
- Active state: `bg-evergreen` text white.
- Inactive state: `text-slate-400` (Keep or update to neutral gray).

### Vendor Cards
- "Winner" badge: Use `bg-accent-gold` or `bg-accent-green`.
- Score numbers: Use `Montserrat` font.
- Borders: `hover:border-accent-gold`.

### Vendor Detail
- Headings: `Montserrat`.
- Primary actions (Save, Generate Insight): `bg-evergreen`.

## 5. Execution Strategy - "Don't Break The App"
We will apply these changes incrementally.

1.  **Step 1:** Configure Tailwind (Fonts & Colors).
2.  **Step 2:** Apply global typography changes in `index.css`.
3.  **Step 3:** Update the main `App.tsx` layout and Header.
4.  **Step 4:** Update `VendorCards.tsx` and `Dashboard.tsx` visualization colors.
5.  **Step 5:** Review and refine.

---
**Note:** This plan prioritizes "not breaking the app" by strictly adding to the tailwind config and then selectively replacing classes, rather than rewriting component logic.
