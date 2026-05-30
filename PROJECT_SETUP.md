# BizFlow Enterprise - Project Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Project Structure](#project-structure)
5. [Key Features](#key-features)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)

---

## 🎯 Project Overview

BizFlow Enterprise is a comprehensive business management suite featuring:
- Modern authentication system with JWT
- Organization and branch management
- User management with role-based access control
- Responsive dashboard with dark/light theme support
- Built with Angular 20, NestJS, MongoDB, and Tailwind CSS

**Color Palette (from Logo):**
- Primary Blue: `#0066ff`
- Secondary Cyan: `#00bfff`
- Danger Red: `#ef4444`
- Success Green: `#22c55e`
- Warning Orange: `#f59e0b`
- Info Cyan: `#0ea5e9`

---

## 🏗️ Architecture

### Frontend (Angular 20)
```
bizflow-ui/
├── src/
│   ├── app/
│   │   ├── core/              # Core services, guards, models
│   │   │   ├── guards/        # Auth guards
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── services/      # Core services (Auth, Theme)
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── users/         # User management
│   │   │   ├── organizations/ # Organization management
│   │   │   └── branches/      # Branch management
│   │   ├── layout/            # Shared layout components
│   │   │   └── components/    # Header, Sidebar, Footer
│   │   ├── shared/            # Shared utilities
│   │   │   ├── components/    # Reusable components
│   │   │   ├── directives/    # Custom directives
│   │   │   ├── pipes/         # Custom pipes
│   │   │   └── utils/         # Utility functions
│   │   └── app.routes.ts      # Route configuration
│   ├── styles.scss            # Global styles with Tailwind
│   ├── environments/          # Environment configurations
│   └── index.html
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json
```

### Backend (NestJS)
```
bizflow-api/
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── controllers/       # Auth endpoints
│   │   ├── services/          # Auth logic
│   │   ├── strategies/        # JWT strategy
│   │   ├── guards/            # Auth guards
│   │   ├── decorators/        # Custom decorators
│   │   └── dto/               # Data transfer objects
│   ├── users/                 # User management module
│   │   ├── controllers/       # User endpoints
│   │   ├── services/          # User logic
│   │   ├── schemas/           # MongoDB schemas
│   │   └── dto/               # DTOs
│   ├── organizations/         # Organization module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── dto/
│   ├── branches/              # Branch module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── dto/
│   ├── shared/                # Shared utilities
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   ├── pipes/             # Custom pipes
│   │   └── utils/             # Utility functions
│   ├── config/                # Configuration
│   ├── main.ts                # Application entry point
│   └── app.module.ts          # Root module
├── .env.example               # Environment template
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 5.x (Local or Atlas)
- npm or pnpm

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd bizflow-ui
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Configure environment variables:**
   - Create/update `src/environments/environment.ts`
   - Already configured with defaults

4. **Start development server:**
   ```bash
   ng serve
   # or pnpm start
   ```
   Access at: `http://localhost:4200`

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd bizflow-api
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
4. **Update `.env` file with your settings:**
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bizflow
   JWT_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   # or
   pnpm start:dev
   ```
   API runs at: `http://localhost:3000/api`

---

## 📁 Project Structure Details

### Global Styling (Tailwind)

Custom color system based on BizFlow logo:
- **Primary**: `primary-50` to `primary-900` (#0066ff base)
- **Secondary**: `secondary-50` to `secondary-900` (#00bfff base)
- **Semantic Colors**: `danger`, `success`, `warning`, `info`
- **Neutral**: `neutral-50` to `neutral-900` (for text, backgrounds)

### Component Classes

Pre-built Tailwind component classes:
```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-success">Confirm</button>

<!-- Cards -->
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>

<!-- Badges -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-danger">Danger</span>

<!-- Alerts -->
<div class="alert alert-danger">
  <span>⚠️</span>
  <span>This is an error message</span>
</div>
```

### Theme Switching

The application supports light and dark modes:

```typescript
// In any component
constructor(private themeService: ThemeService) {}

toggleTheme() {
  this.themeService.toggleTheme();
}

isDarkMode() {
  return this.themeService.isDarkMode();
}
```

Theme preference is automatically saved to localStorage.

---

## 🔐 Authentication Flow

### Registration
1. User submits: email, password, firstName, lastName, organizationName
2. Backend creates User + Organization
3. JWT tokens (access + refresh) returned
4. User redirected to dashboard

### Login
1. User submits: email, password
2. Backend validates credentials
3. JWT tokens returned
4. Tokens stored in localStorage
5. User redirected to dashboard

### Token Management
- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- Automatic refresh on expiration
- Token in Bearer header: `Authorization: Bearer <token>`

---

## 🔑 Environment Configuration

### Frontend Environment Variables
`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    expiresInKey: 'token_expires_in',
  },
  theme: {
    storageKey: 'theme_preference',
    defaultTheme: 'light',
  },
};
```

### Backend .env
```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=BizFlow API

# Database
MONGODB_URI=mongodb://localhost:27017/bizflow
DB_NAME=bizflow

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:4200

# Logging
LOG_LEVEL=debug
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Frontend:**
```bash
cd bizflow-ui
pnpm start
```

**Terminal 2 - Backend:**
```bash
cd bizflow-api
pnpm start:dev
```

### Production Build

**Frontend:**
```bash
cd bizflow-ui
ng build --configuration production
```

**Backend:**
```bash
cd bizflow-api
npm run build
npm run start:prod
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}

Response: {
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... },
  "expiresIn": 86400
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: {
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... },
  "expiresIn": 86400
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <access_token>

Response: {
  "success": true,
  "data": { ... }
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: {
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... },
  "expiresIn": 86400
}
```

---

## 🎨 Dashboard Features

### Key Components

1. **Sidebar**
   - Navigation menu
   - Organization quick links
   - User profile dropdown
   - Theme toggle

2. **Header**
   - Page title
   - Search bar
   - Notifications
   - Messages
   - User menu

3. **Dashboard Main**
   - KPI Cards (Revenue, Orders, Users, Conversion)
   - Revenue Overview Chart
   - Top Categories
   - Recent Activities Feed

### Responsive Design
- **Mobile**: Single column, hamburger sidebar
- **Tablet**: 2 columns
- **Desktop**: Full layout with sidebar

---

## 📦 Key Dependencies

### Frontend
- `@angular/core`: ^20.3.0
- `@angular/forms`: ^20.3.0
- `@angular/router`: ^20.3.0
- `tailwindcss`: ^3.4.1
- `lucide-angular`: Icons
- `rxjs`: ~7.8.0

### Backend
- `@nestjs/core`: ^11.0.1
- `@nestjs/mongoose`: MongoDB integration
- `@nestjs/jwt`: JWT authentication
- `@nestjs/passport`: Passport integration
- `mongoose`: ^7.x
- `bcrypt`: Password hashing
- `passport-jwt`: JWT strategy

---

## 🐛 Troubleshooting

### Frontend Issues

**Port 4200 already in use:**
```bash
ng serve --port 4300
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
pnpm install
```

### Backend Issues

**MongoDB connection error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas: use full connection string

**JWT errors:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify Authorization header format

---

## 📖 Additional Resources

- [Angular Documentation](https://angular.io)
- [NestJS Documentation](https://docs.nestjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [MongoDB Documentation](https://docs.mongodb.com)

---

## 📝 License

Proprietary - BizFlow Enterprise

---

## 👥 Team

For questions or support, contact the development team.
