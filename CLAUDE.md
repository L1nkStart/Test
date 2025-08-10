# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js (App Router) insurance management system for managing insurance holders and policies. It's a technical test project that demonstrates a professional CRM interface with authentication, data management, and role-based access control.

## Development Commands

### Common Commands
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build the production application
- `npm run start` - Start production server on port 3001
- `npm run lint` - Run Next.js linting

### Database Setup
The project uses MySQL with Docker for containerized development:
- `docker-compose up -d` - Start MySQL container
- Database scripts are in `/database/` directory:
  - `01_create_users.sql` - Creates users table
  - `02_create_insurance_holders.sql` - Creates insurance_holders table
  - `03_seed_data.sql` - Seeds test data (1 admin user + 50 insurance holders)

### Environment Configuration
- Copy `env-example.txt` to `.env`
- Required: `DATABASE_URL="mysql://user:password@localhost:3306/test"`
- Default login: admin@example.com / admin

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: MySQL with mysql2 driver
- **UI Framework**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **Authentication**: Custom session-based auth with middleware
- **Icons**: Lucide React

### Key Architectural Patterns

#### Authentication System
- Cookie-based sessions with secure middleware (`middleware.ts`)
- Session utilities in `lib/session-utils.ts`
- Full user session management in `lib/auth.ts`
- Role-based access control (admin roles: "Superusuario", "Coordinador Regional")

#### Database Layer
- Connection pooling via `lib/db.ts`
- Server-only database access
- Two main entities:
  - `users` - Authentication and roles
  - `insurance_holders` - Insurance policy holders with comprehensive fields

#### Route Structure
- `/login` - Authentication page
- `/(protected)/dashboard` - Main insurance holders management
- `/api/auth/login` - Authentication endpoint
- `/api/insurance-holders` - CRUD operations for insurance data
- `/api/current-user-role` - User role verification

### Component Architecture
- Server Components for data fetching and layout
- Client Components for interactivity (dashboard page)
- shadcn/ui component system with consistent styling
- Custom components:
  - `AppSidebar` - Navigation sidebar
  - `DashboardHeader` - Header with user controls
  - `InsuranceHolderForm` - CRUD form for insurance holders
  - `ThemeProvider` - Dark/light theme support

### Database Schema Notes
- `users.assignedStates` - JSON field for regional assignments
- `insurance_holders` - Comprehensive insurance data with policy details, coverage amounts, medical history
- Both tables have `isActive` boolean for soft deletes
- `insurance_holders` includes contact info, policy details, coverage amounts, emergency contacts, medical data

### Styling System
- Tailwind with custom CSS variables for theming
- Status colors defined in config: active (green), inactive (red), pending (yellow)
- Custom font: InterVariable for modern typography
- Responsive design patterns with mobile-first approach

### Current Implementation Status
- Basic CRUD operations for insurance holders
- Search and filtering functionality
- Statistics cards showing totals
- Role-based UI permissions
- Responsive table layout with overflow handling

### Areas for Enhancement (Technical Test Context)
The README indicates this is a technical test with focus on:
1. **Pagination Implementation** - Currently loads all records, needs server-side pagination
2. **UI/UX Redesign** - Transform basic shadcn components into professional CRM interface
3. **Performance Optimization** - Improve data fetching strategies for scalability

### Development Guidelines
- Use Server Components by default, Client Components only when interactivity is needed
- Follow shadcn/ui patterns for consistent component styling
- Implement proper error handling with toast notifications
- Use TypeScript interfaces for all data structures
- Follow Next.js App Router conventions for file organization