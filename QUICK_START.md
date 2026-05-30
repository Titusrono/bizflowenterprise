# BizFlow Enterprise - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone the Repository
```bash
cd bizflowenterprise
```

### Step 2: Install Dependencies

**Frontend:**
```bash
cd bizflow-ui
pnpm install
```

**Backend:**
```bash
cd ../bizflow-api
pnpm install
```

### Step 3: Setup Environment

**Backend (.env):**
```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/bizflow
JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
CORS_ORIGIN=http://localhost:4200
```

**Frontend (already configured):**
- `src/environments/environment.ts` is ready for development

### Step 4: Start MongoDB
```bash
# If using MongoDB locally
mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd bizflow-api
pnpm start:dev
```
Backend runs at: `http://localhost:3000/api`

**Terminal 2 - Frontend:**
```bash
cd bizflow-ui
ng serve
# or pnpm start
```
Frontend runs at: `http://localhost:4200`

### Step 6: Test the Application

**Login Credentials (Dummy):**
- Email: `test@example.com`
- Password: `TestPass123` (or register a new account)

---

## 📁 Creating New Features

### Create a New Component

**Frontend:**
```bash
cd bizflow-ui
ng generate component features/my-feature/pages/my-feature
ng generate component features/my-feature/components/my-component
```

This automatically creates:
- Component folder with `.ts`, `.html`, `.scss` files
- Proper module setup

**Add Tailwind Styling:**
```html
<div class="container-custom py-8">
  <h1 class="text-3xl font-bold mb-6">My Feature</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="card">
      <div class="card-header">
        <h2>Card Title</h2>
      </div>
      <div class="card-body">
        Content here
      </div>
    </div>
  </div>
</div>
```

### Add Backend Endpoint

**Create Controller:**
```typescript
// src/my-feature/controllers/my-feature.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MyFeatureService } from '../services/my-feature.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/my-feature')
export class MyFeatureController {
  constructor(private service: MyFeatureService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll() {
    return this.service.findAll();
  }
}
```

**Create Service:**
```typescript
// src/my-feature/services/my-feature.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MyFeatureService {
  constructor(@InjectModel(MyFeature.name) private model: Model<any>) {}

  async findAll() {
    return this.model.find().exec();
  }
}
```

**Create Schema:**
```typescript
// src/my-feature/schemas/my-feature.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class MyFeature {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MyFeatureSchema = SchemaFactory.createForClass(MyFeature);
```

### Register New Module

**Backend:**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MyFeatureModule } from './my-feature/my-feature.module';

@Module({
  imports: [MyFeatureModule],
})
export class AppModule {}
```

---

## 🎨 Using Tailwind Components

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary">Click Me</button>

<!-- Variants -->
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-full">Full Width</button>

<!-- States -->
<button class="btn btn-primary" disabled>Disabled</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h2 class="text-xl font-bold">Card Title</h2>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Forms
```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium mb-2">Name</label>
    <input type="text" class="input-field" placeholder="Enter name">
  </div>

  <div>
    <label class="block text-sm font-medium mb-2">Email</label>
    <input type="email" class="input-field" placeholder="Enter email">
  </div>

  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Alerts
```html
<!-- Success Alert -->
<div class="alert alert-success">
  <span>✓</span>
  <span>Operation successful!</span>
</div>

<!-- Error Alert -->
<div class="alert alert-danger">
  <span>✕</span>
  <span>An error occurred</span>
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
  <span>⚠️</span>
  <span>Please review your changes</span>
</div>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>
```

---

## 🌙 Dark Mode

### Global Theme Switching
The theme switcher is in the sidebar. Click the moon/sun icon to toggle.

### Using Theme in Components
```typescript
import { ThemeService } from './services/theme.service';

export class MyComponent {
  constructor(private themeService: ThemeService) {}

  isDark = this.themeService.isDarkMode();
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### Tailwind Dark Mode Classes
```html
<!-- Text color changes in dark mode -->
<p class="text-neutral-900 dark:text-white">
  This text is black in light mode, white in dark mode
</p>

<!-- Background changes -->
<div class="bg-white dark:bg-neutral-900 p-4">
  Background adapts to theme
</div>

<!-- Border changes -->
<div class="border border-neutral-200 dark:border-neutral-700">
  Border adapts to theme
</div>
```

---

## 🔐 Using Auth Service

### Check if User is Logged In
```typescript
import { AuthService } from './services/auth.service';

export class MyComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated$.subscribe(isAuth => {
      console.log('Is authenticated:', isAuth);
    });
  }
}
```

### Check User Permissions
```typescript
export class MyComponent {
  constructor(private authService: AuthService) {}

  canDelete = this.authService.hasRole(['admin', 'manager']);
  
  hasPermission = this.authService.hasPermission('delete');
}
```

### Login/Register in Component
```typescript
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
```

---

## 🔧 Common Tasks

### Add a New User Role
1. Update `UserRole` enum in `src/app/core/models/index.ts`
2. Update `roles.enum` in backend `src/auth/roles.enum.ts`
3. Add role validation in DTOs

### Change API Base URL
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'https://api.yoursite.com'
};
```

### Add New Color to Tailwind
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'custom': {
        50: '#f0f9ff',
        500: '#your-color',
        900: '#dark-shade',
      }
    }
  }
}
```

---

## 🐛 Debugging

### Frontend
- **Browser DevTools**: F12
- **Angular DevTools**: Browser extension
- **Console Logs**: Check browser console
- **Network Tab**: Check API calls

### Backend
- **Logs**: Check terminal output
- **Postman**: Test API endpoints
- **MongoDB Compass**: Browse database
- **Debug Mode**: `npm run start:debug`

---

## 📚 Useful Commands

### Frontend
```bash
ng generate component path/component-name        # New component
ng generate service path/service-name            # New service
ng build --configuration production              # Production build
ng test                                          # Run tests
ng lint                                          # Lint code
```

### Backend
```bash
npm run start:dev                                # Dev server with watch
npm run start:debug                              # Debug mode
npm run build                                    # Build for production
npm test                                         # Run tests
npm run lint                                     # Lint code
```

---

## 🆘 Need Help?

1. Check the `PROJECT_SETUP.md` for detailed documentation
2. Review the existing components for patterns
3. Check browser/server console for errors
4. Verify MongoDB is running and accessible
5. Ensure all environment variables are set

Happy coding! 🎉
