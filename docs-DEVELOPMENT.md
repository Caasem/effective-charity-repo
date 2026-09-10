# Development Guide

## Project Structure

```
muslim-philanthropy-network/
├── frontend/                    # React/Next.js frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # Reusable components
│   │   │   ├── Donations/
│   │   │   ├── Initiatives/
│   │   │   ├── Layout/
│   │   │   └── Common/
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts        # API client
│   │   │   ├── auth.ts       # Auth utilities
│   │   │   └── stripe.ts     # Stripe integration
│   │   ├── types/             # TypeScript types
│   │   ├── store/             # Zustand state
│   │   └── styles/            # Global CSS
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts
│   │   │   ├── initiatives.ts
│   │   │   ├── donations.ts
│   │   │   ├── users.ts
│   │   │   └── payments.ts
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Database models/queries
│   │   ├── types/             # TypeScript types
│   │   ├── lib/               # Utilities
│   │   │   ├── db.ts         # Database connection
│   │   │   ├── jwt.ts        # JWT utilities
│   │   │   ├── stripe.ts     # Stripe SDK
│   │   │   └── validators.ts # Input validation
│   │   └── migrations/        # Database migrations
│   ├── .env.example
│   ├── tsconfig.json
│   └── jest.config.js
│
├── database/
│   ├── schema.sql            # PostgreSQL schema
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Seed data
│   └── README.md
│
├── docs/                      # Documentation
│   ├── API.md
│   ├── DEVELOPMENT.md
│   └── ARCHITECTURE.md
│
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json
├── README.md
└── LICENSE
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional, for local database)

### 2. Clone & Install

```bash
git clone <repo>
cd muslim-philanthropy-network

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cp .env.example .env.local

# Install backend dependencies
cd ../backend
npm install
cp .env.example .env
```

### 3. Database Setup

**Option A: Using Docker**
```bash
docker-compose up -d postgres redis
# Wait for postgres to be ready (check healthcheck)
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb mpn

# Load schema
psql mpn < database/schema.sql
```

### 4. Configure Environment

**Backend (.env)**
```bash
DATABASE_URL=postgresql://mpn_user:mpn_dev_password@localhost:5432/mpn
JWT_SECRET=dev_secret_key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NODE_ENV=development
API_PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 5. Run Development Servers

```bash
# From root directory
npm run dev

# This runs:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
```

Individual servers:
```bash
npm run frontend   # Just frontend
npm run backend    # Just backend
```

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- All external APIs strongly typed

### Code Style
```bash
# Format code
cd frontend && npm run format
cd ../backend && npm run format

# Lint
cd frontend && npm run lint
cd ../backend && npm run lint
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `DonationForm.tsx`)
- Utilities: `camelCase.ts` (e.g., `apiClient.ts`)
- Types: `PascalCase.ts` (e.g., `Initiative.ts`)

**Variables/Functions:**
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants
- PascalCase for classes and types

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/donor-notifications

# Make changes, commit
git add .
git commit -m "feat: add email notifications for donors"

# Push and create PR
git push origin feature/donor-notifications
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
Scope: `auth`, `donations`, `initiatives`, `payments`, etc
Subject: imperative, lowercase, no period

Example:
```
feat(donations): add recurring donation support

- Allow donors to set up monthly recurring donations
- Add subscription management UI
- Stripe integration for recurring payments

Closes #123
```

## Component Structure

### React Component Template

```typescript
// src/components/Donations/DonationForm.tsx
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

interface DonationFormProps {
  initiativeId: string;
  onSuccess?: () => void;
}

export const DonationForm: FC<DonationFormProps> = ({ 
  initiativeId, 
  onSuccess 
}) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      amount: 50,
      givingType: 'sadaqah',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // API call
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      {/* Form fields */}
    </form>
  );
};
```

## API Integration

### Creating API Endpoints

**Backend (src/routes/donations.ts):**
```typescript
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { donationsController } from '../controllers';

const router = Router();

router.post('/', auth, donationsController.create);
router.get('/history', auth, donationsController.getHistory);

export default router;
```

**Frontend Hook (src/hooks/useDonations.ts):**
```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDonations() {
  const createDonation = useMutation({
    mutationFn: (data) => api.post('/donations', data),
  });

  const history = useQuery({
    queryKey: ['donations', 'history'],
    queryFn: () => api.get('/donations/history'),
  });

  return { createDonation, history };
}
```

## Testing

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# With coverage
npm test -- --coverage
```

### Writing Tests

**Jest Test Example:**
```typescript
describe('DonationForm', () => {
  it('should submit donation with correct data', async () => {
    render(<DonationForm initiativeId="123" />);
    
    const input = screen.getByRole('spinbutton', { name: /amount/i });
    await userEvent.clear(input);
    await userEvent.type(input, '100');
    
    const button = screen.getByRole('button', { name: /donate/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100 })
      );
    });
  });
});
```

## Deployment

### Staging

```bash
# Build and deploy to staging
npm run build
# Push to staging branch - CI/CD will deploy
git push origin main
```

### Production

```bash
# Create version tag
git tag v0.2.0
git push origin v0.2.0
# CI/CD will build and deploy to production
```

## Debugging

### Frontend
- React DevTools browser extension
- Next.js debugger in VSCode
- Console and Network tabs in DevTools

### Backend
```bash
# Run with debugging
node --inspect dist/index.js

# In VSCode, attach debugger
# Or use Chrome chrome://inspect
```

### Database
```bash
# Connect to local database
psql mpn

# Useful queries
SELECT * FROM donations WHERE status = 'pending';
SELECT * FROM initiatives ORDER BY created_at DESC;
```

## Useful Commands

```bash
# Format all code
npm run format

# Type checking
npm run type-check

# Database migrations
cd backend && npm run db:migrate
npm run db:seed
npm run db:rollback

# Generate API types from Swagger (if implemented)
npm run generate:api-types
```

## Troubleshooting

### "Can't connect to database"
```bash
# Check if postgres is running
docker ps | grep postgres

# Or locally
psql -U mpn_user -d mpn -c "SELECT 1;"

# Check connection string in .env
```

### "Port 3000/5000 already in use"
```bash
# Find process on port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Stripe API](https://stripe.com/docs/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)

## Questions?

Open an issue or ask in team discussions.
