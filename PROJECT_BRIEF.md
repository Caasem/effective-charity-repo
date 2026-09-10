# Muslim Philanthropy Network

A neutral digital network that connects Muslim charities, donors, businesses, volunteers and resources to genuine needs — making giving easier, reducing duplication and improving accountability.

## 🎯 Product Philosophy

**The Network does not compete with charities. It provides infrastructure that helps them work better together.**

## 🏗️ Architecture

```
frontend/      → React + Next.js + TypeScript + Tailwind (Revolut-style UX)
backend/       → Node.js + Express + TypeScript
database/      → PostgreSQL schema + migrations
docs/          → API documentation, product specs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Setup

```bash
# Install root dependencies
npm install

# Setup frontend
cd frontend
npm install
# Create .env.local from .env.example
cp .env.example .env.local

# Setup backend
cd ../backend
npm install
# Create .env from .env.example
cp .env.example .env

# Start development servers
cd ..
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Features (Sprint 2 - Donor View)

- ✅ Browse initiatives
- ✅ Search by location/cause
- ✅ Donation types: Sadaqah, Zakat, Waqf, Recurring
- ✅ Donation history
- ✅ Impact tracking
- 🔄 Payment integration (Stripe)
- 🔄 Real-time updates (WebSocket)

## 🗺️ Roadmap

### Sprint 1: The Network (Foundation)
- Charity profiles
- Initiative structure
- Need tracking
- Verification

### Sprint 2: The Donor (Current)
- Browse/search initiatives
- Multiple giving types
- Donation tracking
- Impact updates

### Sprint 3: The Charity
- Charity dashboard
- Initiative management
- Resource tracking
- Donor communication

### Sprint 4: Coordination
- Partner discovery
- Duplicate detection
- Collaboration matching
- Impact deduplication

## 🔐 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form
- **Payments**: Stripe.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Payments**: Stripe API
- **Testing**: Jest

### Database
- PostgreSQL 14+
- Migrations via TypeORM/Knex
- Connection pooling via node-postgres

## 🎨 Design Principles

1. **Trust First**: Verification and accountability built-in
2. **Charity-Centric**: Charities remain visible, not hidden
3. **Fast & Frictionless**: Revolut-like UX, instant feedback
4. **Transparent**: Clear fee structure, no hidden costs
5. **Privacy**: User data never sold, minimal tracking

## 📊 Database Schema

See `database/schema.sql` for complete schema.

Key entities:
- `users` (donors, charity staff, volunteers)
- `organisations` (charities, businesses)
- `initiatives` (campaigns, projects)
- `needs` (specific resource requirements)
- `donations` (contribution records)
- `evidence` (photos, reports, verification)

## 🔑 Environment Variables

See `.env.example` files in frontend/ and backend/

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `JWT_SECRET`: JWT signing key

## 🚦 Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Open PR with description

## 📝 Commit Convention

```
feat:    new feature
fix:     bug fix
docs:    documentation
style:   formatting
refactor: code restructuring
test:    tests
chore:   maintenance
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## 📚 Documentation

- API docs: See `backend/README.md`
- Frontend setup: See `frontend/README.md`
- Database schema: See `database/README.md`

## 💰 Payment Processing

- Uses Stripe for PCI compliance
- Payments processed server-side (secure)
- Instant receipts via email
- Donation records preserved in database

## 🔄 Real-Time Updates

- WebSocket connection for live initiative updates
- Donation notifications to charities
- Impact updates streamed to donors

## 📞 Support

For questions or issues, see GitHub Issues.

## 📄 License

MIT - See LICENSE file

---

**Last Updated**: September 2024
**Current Sprint**: 2 (The Donor)
**Status**: MVP Development
