# Financial Fee Savings Calculator

## Overview

A web application that helps users visualize and compare investment fee structures over time. The calculator demonstrates potential savings when switching from percentage-based advisory fees to a flat fee model ($1,200/year). Users can adjust portfolio values, fee percentages, investment timeframes, and expected growth rates to see personalized projections through interactive charts and displays.

The application features:
- Dynamic fee comparison calculations with user-adjustable controls:
  - Portfolio Value: Text input with currency formatting (max $10,000,000)
  - Annual Fee %: Dropdown selector with preset options from 0.10% to 1.50% in 0.10% increments (default 1.00%)
  - Years: Text input with increment/decrement spinners (max 30 years)
  - Annual Portfolio Growth: Dropdown selector from 4.00% to 12.00% in 0.50% increments (default 8.00%)
- Interactive area chart visualization showing savings growth over time
- Fee summary information integrated directly into chart using native Recharts components
  - Rendered via Recharts `<Customized>` component with responsive percentage-based positioning
  - Displays "Total Savings over X Years" and "First Year Savings" with formatted currency values
  - Positioned responsively with breakpoint-based percentages:
    - Mobile (< 768px): 10% left / 90% right (maximum separation)
    - Tablet (768px+): 15% left / 85% right
    - Desktop (1024px+): 18% left / 82% right
  - Uses theme-aware CSS variables (`hsl(var(--foreground))`, `hsl(var(--muted-foreground))`) for dark/light mode compatibility
  - Text elements are part of chart's SVG rendering lifecycle, ensuring reliable updates
  - Coordinates calculated dynamically based on chart width and screen size for optimal layout
  - Responsive chart configuration:
    - Chart margins: Mobile (10px/20px), Tablet (24px/24px), Desktop (32px/36px)
    - Y-axis width: Mobile (55px), Tablet (70px), Desktop (80px)
    - Container max-width: Mobile (402px), Tablet (896px/max-w-4xl), Desktop (1024px/max-w-5xl)
- User survey section (650px width, three dots toggle in upper right, compact collapsed state)
  - Survey options: "Invest it!", "Donate to my favorite charity", "Give it to my Financial Advisor!", "Make home improvements", "Retire earlier", "Other"
  - Bold exclamation points on "Invest it!" and full bold formatting on "Give it to my Financial Advisor!"
  - Radio buttons styled in brand evergreen color (#006044)
  - One-vote-only behavior with localStorage persistence
- Image slider component with three financial planning slides
  - Previous/next arrow buttons (ChevronLeft/ChevronRight icons) with wrap-around navigation
  - White buttons with evergreen (#006044) text color and subtle shadow
  - Visual dot indicators showing active slide (elongated active state)
  - Smooth CSS transitions (500ms ease-in-out) using translateX transform
  - Responsive 16:9 aspect ratio design with rounded corners
  - Responsive padding and button positioning:
    - Mobile (<768px): 16px padding, buttons at edges
    - Tablet (≥768px): 48px padding, buttons inset 8px
    - Desktop (≥1024px): 64px padding, buttons inset 8px
  - Buttons positioned outside overflow container in padded safe zones to prevent clipping
- Responsive design suitable for desktop and mobile devices

## User Preferences

Preferred communication style: Simple, everyday language.

You must follow this UI Editing Protocol for all layout/style changes:

Do NOT refactor or rewrite entire files.

Modify ONLY the files I show you.

For UI/layout changes, use Tailwind layout utilities only:

alignment: justify-end, ml-auto, mr-auto, justify-between, items-center, etc.

spacing: gap-4/gap-6, p-4, px-4, py-2

width: w-4/5, w-3/4, max-w-md, max-w-lg

Keep diffs MINIMAL:

change the smallest number of lines possible

do not reorder classes or move code unless absolutely required.

Never change component logic, props, or handlers.

If you need to change more than ~8 lines, STOP and describe the plan instead.

For every change, respond with: (1) short explanation (2) unified diff (3) full updated component file

If you are uncertain which element controls a visual change, say so and ask me which component or section to edit.

## System Architecture

### Frontend Architecture

**Framework**: React 19 with TypeScript, using functional components and hooks exclusively

**Build Tool**: Vite with custom configuration for client-side bundling and hot module replacement

**Routing**: Wouter for lightweight client-side routing (single-page calculator application)

**State Management**: 
- React hooks (useState, useMemo, useEffect) for local component state
- TanStack Query for server state management (infrastructure in place but minimal API usage)
- LocalStorage for persisting survey results and voting state

**UI Component Library**: 
- Radix UI primitives for accessible, unstyled component foundation
- shadcn/ui component system (New York style variant)
- Custom components built on top of Radix primitives

**Styling**:
- Tailwind CSS with custom configuration
- CSS variables for theme colors and design tokens
- Custom brand colors: evergreen (#006044), light green accent (#76a923), gold accent (#af8a49)
- Typography: Montserrat for headings/numbers (600-800 weight), Source Sans 3 for body text (400-600 weight)
- Dark mode support via class-based theme switching

**Data Visualization**: Recharts library for rendering responsive area charts with custom tooltips and legends

**Form Handling**: React Hook Form with Zod resolvers (infrastructure present, minimal current usage)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Development Setup**:
- TSX for TypeScript execution in development
- ESBuild for production bundling
- Vite middleware integration for development server

**API Structure**: 
- RESTful API pattern with `/api` prefix
- Minimal current implementation (infrastructure ready for expansion)
- Request/response logging middleware
- JSON body parsing with raw body preservation

**Storage Layer**:
- Abstracted storage interface (IStorage) for CRUD operations
- In-memory storage implementation (MemStorage) as default
- User model defined but not actively used in current calculator flow
- Prepared for database integration via interface pattern

**Session Management**: Infrastructure includes connect-pg-simple for PostgreSQL session storage (not currently active)

### Data Storage Solutions

**Database ORM**: Drizzle ORM configured for PostgreSQL

**Database Provider**: Neon serverless PostgreSQL (@neondatabase/serverless)

**Schema Management**:
- Schema definitions in `shared/schema.ts`
- Migration files output to `./migrations`
- Database configuration via environment variable (DATABASE_URL)

**Current Data Models**:
- User schema (defined but minimal usage)
- ChartDataPoint interface for savings visualization data
- SurveyResults type for poll data
- Survey options as typed constants

**Client-side Storage**:
- LocalStorage for survey voting state and results
- No current server-side persistence of calculator inputs or survey data

### Authentication & Authorization

**Current State**: Minimal authentication infrastructure

**Prepared Components**:
- Session storage configuration (PostgreSQL-backed sessions via connect-pg-simple)
- User schema with username field
- Storage interface methods for user retrieval
- Query client configured with 401 handling options

**Authorization Pattern**: Infrastructure supports returning null or throwing on 401 responses, but no active authentication flows implemented

### External Dependencies

**Core Runtime**:
- Node.js with ES modules
- TypeScript for type safety across frontend and backend

**UI & Styling**:
- Radix UI component primitives (accordion, dialog, dropdown, slider, etc.)
- Tailwind CSS with PostCSS and Autoprefixer
- Class Variance Authority for component variant management
- clsx and tailwind-merge for className utilities

**Charts & Visualization**:
- Recharts for chart rendering
- Embla Carousel for carousel interactions

**Forms & Validation**:
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Database & ORM**:
- Drizzle ORM for database queries and schema
- Drizzle-Zod for schema-to-Zod conversion
- @neondatabase/serverless for PostgreSQL connection

**Development Tools**:
- Vite plugins for development experience (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- Wouter for client-side routing
- date-fns for date utilities

**APIs & External Services**: None currently integrated (no external API calls, payment processors, or third-party service integrations)

**Fonts**: Google Fonts (Montserrat and Source Sans 3) loaded via CDN