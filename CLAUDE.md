# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Omada 研发人力排布可视化工具" - an enterprise-level R&D team manpower allocation and flow analysis tool. It's a React + TypeScript + Vite application that visualizes team resource allocation across multiple projects and time points using advanced chart visualizations including Sankey diagrams.

## Essential Commands

**Development:**
```bash
npm run dev        # Start development server on http://localhost:5173
npm run build      # Build for production (TypeScript check + Vite build)
npm run preview    # Preview production build on http://localhost:4173
```

**Code Quality:**
```bash
npm run lint       # Run ESLint for code linting
npm run test       # Run vitest for testing
npm run test:coverage  # Run tests with coverage report
```

**Type Checking:**
The build command (`npm run build`) includes TypeScript compilation (`tsc -b`) which performs type checking.

## Architecture Overview

### State Management Architecture
- **Zustand stores** with persistence and devtools
- `src/stores/configStore.ts` - Configuration data (teams, projects, time points)
- `src/stores/dataStore.ts` - Business data (allocation matrix, validation results)
- Both stores use localStorage persistence with versioned migration

### Core Data Flow
1. **Configuration Layer**: Teams, projects, and time points managed in configStore
2. **Allocation Layer**: 3D matrix structure (timePoint → project → team → allocation) in dataStore
3. **Visualization Layer**: Complex algorithms convert allocation data to Sankey/chart formats
4. **Export Layer**: HTML dashboard generation with complete algorithm replication

### Module Structure
```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base components (Button, Switch, Modal, etc.)
│   ├── charts/      # Chart components (ECharts-based)
│   └── ...          # Other shared components
├── modules/         # Feature modules
│   ├── config/      # Configuration management (teams/projects/time)
│   ├── allocation/  # Manpower allocation grid
│   └── visualization/ # Dashboard charts and visualizations
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and algorithms
```

### Key Technical Patterns

**Allocation Matrix Structure:**
```typescript
AllocationMatrix = {
  [timePointId]: {
    [projectId]: {
      [teamId]: { occupied: number, prerelease: number }
    }
  }
}
```

**Sankey Algorithm Logic:**
- Resource collection from previous time point by team
- Demand analysis for current time point by team
- Smart allocation: same project inheritance → team type matching → remaining resource distribution
- Connection line merging for same source/target pairs

**Chart Integration:**
- Uses ECharts 5.x with echarts-for-react wrapper
- Custom themes and responsive configurations
- Complex data transformations for Sankey and distribution charts

## Development Guidelines

### Component Development
- Follow existing UI component patterns in `src/components/ui/`
- Use Tailwind CSS for styling with consistent spacing/color system
- Implement TypeScript interfaces for all component props
- Support responsive design patterns

### Data Handling
- Always validate data through the stores' validation system
- Use the allocation matrix helper methods for data access
- Maintain data consistency between stores when making changes
- Respect the 3D matrix structure for allocation data

### Chart Development
- Extend existing chart components in `src/modules/visualization/`
- Use consistent color themes from team/project configurations
- Implement proper responsive behavior and loading states
- Follow ECharts option patterns used in existing components

### State Updates
- Use store actions for all state modifications
- Trigger validation after allocation changes
- Clear derived data (like sankeyData) when base data changes
- Batch related updates using store's batch update methods

## Build Configuration

- **Vite config**: Manual chunks for vendor, charts, and utils libraries
- **TypeScript**: Composite project setup with app and node configs
- **ESLint**: TypeScript + React hooks + React refresh configurations
- **Tailwind**: PostCSS integration with custom design system

## Data Persistence

- Configuration and allocation data persist to localStorage
- Versioned storage with migration support (currently v6)
- Import/export functionality for backup and sharing
- HTML export with embedded data and algorithms

## Testing Strategy

Test coverage should focus on:
- Allocation matrix manipulation algorithms
- Data validation logic
- Chart data transformation functions
- Store state management and persistence
- Component rendering and interaction

Run `npm run test` for unit tests and `npm run test:coverage` for coverage reports.