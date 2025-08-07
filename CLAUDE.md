# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Building Administrator is a React-based web application for residential building management, facilitating tenant-administration communication, laundry reservations, receipt generation, and utility tracking. It uses Firebase for backend services including Firestore database, Storage, Authentication, and Cloud Functions.

## Development Commands

### NPM Configuration
This project uses legacy peer dependency resolution to handle compatibility between Material-UI v4 and React 18. The `.npmrc` files in both root and functions directories contain `legacy-peer-deps=true`, ensuring all `npm install` commands automatically handle peer dependency conflicts.

### Frontend (React App)
- `npm install` - Install dependencies (uses legacy peer deps automatically)
- `npm start` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle to /build
- `npm test` - Run React tests
- `npm run build:deploy` - Build and deploy everything to Firebase
- `npm run build:deploy:no:functions` - Build and deploy excluding functions

### Firebase Functions
- `cd functions && npm run lint` - Lint cloud functions (required before deploy)
- `cd functions && npm run serve` - Start local Firebase emulators
- `cd functions && npm run deploy` - Deploy functions only
- `cd functions && npm run logs` - View function logs

### Deployment
- `firebase deploy` - Deploy all Firebase services
- `firebase deploy --except functions` - Deploy without functions

## Architecture

### Frontend Structure
- **Entry Point**: `src/App.jsx` - Main app component handling Firebase initialization, routing, and global state
- **Routing**: Two main routes:
  - `/` - MainView for tenants
  - `/admin/*` - Admin panel for building management
- **Database Layer**: `src/utils/dbRequests/` - Centralized Firebase operations
  - `dbutils.js` - Core Firebase initialization and error handling
  - `apartments.js`, `users.js`, `laundry.js`, `invoices.js` - Domain-specific operations
  - `emails.js` - Email notification logic
- **Views**: 
  - `src/views/MainView/` - Tenant-facing features (receipts, laundry booking, shared files)
  - `src/views/Admin/` - Admin dashboard with user/apartment management, receipt generation
- **Components**: Reusable UI components in `src/components/` and view-specific components

### Backend Structure
- **Cloud Functions**: `functions/index.js` - Express-based HTTP functions for email sending and other server operations
- **Database**: Firestore with rules in `firestore.rules`
- **Storage**: Firebase Storage with rules in `storage.rules`
- **Hosting**: Static files served from `/build` directory

### Technology Stack
- **Frontend**: React 18, Material-UI (v4 and v5), React Router v6
- **Backend**: Firebase (Firestore, Storage, Auth, Functions), Node.js 18
- **Build**: Create React App (react-scripts)
- **PDF Generation**: jspdf for receipts
- **Date Handling**: date-fns, dayjs

## Configuration

### Firebase Configuration
Before running locally, create `src/firebaseConfig.js` with your Firebase project credentials. This file is gitignored and must be created manually.

### Environment Variables
- **Frontend (.env)**:
  - `REACT_APP_ADMIN_EMAILS` - Comma-separated list of admin email addresses authorized to access the admin panel
  
- **Firebase Functions**:
  - `CONFIG_NODEMAILER_EMAIL` - Gmail address used for sending emails
  - `CONFIG_NODEMAILER_PASS` - Gmail app password for email authentication
  
  Set these using Firebase CLI:
  ```bash
  firebase functions:config:set config.nodemailer_email="your-email@gmail.com"
  firebase functions:config:set config.nodemailer_pass="your-app-password"
  ```

## Key Features Implementation

- **Authentication**: Firebase Auth integrated in App.jsx, passed to views via props
- **Real-time Data**: Firestore listeners for live updates
- **File Storage**: Firebase Storage for shared documents and receipts
- **Email Notifications**: Cloud Functions handle email sending for reminders and receipts
- **Receipt Generation**: PDF generation using jspdf in the frontend
- **Laundry Reservation System**: Calendar-based booking system with time slot management

## Testing

Tests use React Testing Library and Jest. Run with `npm test`. Currently minimal test coverage exists.

## Linting

- Frontend uses ESLint with React App configuration
- Functions use ESLint with Google configuration (`cd functions && npm run lint`)

## Dependency Migration Notes

The project currently uses a mix of Material-UI v4 (@material-ui) and v5 (@mui) components, which causes peer dependency conflicts with React 18. Legacy peer dependency resolution is configured to allow gradual migration. Key conflicts:
- @material-ui/core@4.11.3 expects React types ^16.8.6 || ^17.0.0
- Project uses @types/react@^18.3.2
- Both Material-UI versions coexist during migration phase