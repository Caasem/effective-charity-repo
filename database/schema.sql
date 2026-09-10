-- Muslim Philanthropy Network Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (donors, charity staff, volunteers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'donor', -- donor, charity_staff, volunteer, admin
  user_type VARCHAR(50), -- individual, business, charity
  location VARCHAR(255),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Organisations (Charities and Businesses)
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- charity, business, ngo
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  founded_year INTEGER,
  registration_number VARCHAR(100) UNIQUE,
  hq_location VARCHAR(255),
  operating_countries TEXT[], -- Array of country names
  areas_of_focus TEXT[], -- Array of causes
  capabilities TEXT[], -- What they can provide: funding, logistics, expertise, etc
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  verification_badge BOOLEAN DEFAULT FALSE,
  charity_commission_url TEXT,
  annual_reports JSONB, -- Links to annual reports
  audit_reports JSONB, -- Financial audits
  financial_data JSONB, -- Revenue, expenses, etc
  rating DECIMAL(3, 2), -- Out of 5
  rating_count INTEGER DEFAULT 0,
  total_funds_raised DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Organisation Members (staff, volunteers)
CREATE TABLE organisation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL, -- admin, manager, staff, volunteer
  title VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(organisation_id, user_id)
);

-- Initiatives (campaigns, projects)
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- food, shelter, healthcare, education, etc
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'active', -- active, completed, paused, cancelled
  urgency VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  start_date DATE,
  end_date DATE,
  funding_goal DECIMAL(15, 2) NOT NULL,
  funding_raised DECIMAL(15, 2) DEFAULT 0,
  funding_percentage INTEGER GENERATED ALWAYS AS (ROUND((funding_raised / NULLIF(funding_goal, 0)) * 100)) STORED,
  donor_count INTEGER DEFAULT 0,
  partner_organisations TEXT[], -- IDs of partner orgs
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Needs (specific resource requirements)
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- food, medical, shelter, etc
  quantity_required INTEGER NOT NULL,
  quantity_unit VARCHAR(50), -- packs, units, liters, people, etc
  quantity_fulfilled INTEGER DEFAULT 0,
  urgency VARCHAR(50) DEFAULT 'medium',
  deadline DATE,
  status VARCHAR(50) DEFAULT 'open', -- open, partially_fulfilled, fulfilled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  giving_type VARCHAR(50) NOT NULL, -- sadaqah, zakat, waqf, recurring
  recurring_frequency VARCHAR(50), -- monthly, quarterly, yearly (if recurring)
  recurring_until DATE, -- End date for recurring donations
  payment_method VARCHAR(50), -- stripe, bank_transfer, cash
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_url TEXT,
  donor_name VARCHAR(255), -- For anonymous or display purposes
  donor_email VARCHAR(255),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence (photos, reports, verification documents)
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- photo, video, report, audit, certificate, letter, other
  title VARCHAR(255),
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50), -- image/jpeg, application/pdf, etc
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Impact Updates (progress reports from charities)
CREATE TABLE impact_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donor Donations History (for tracking)
CREATE TABLE donor_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  giving_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Records (audit trail)
CREATE TABLE verification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES users(id),
  verification_type VARCHAR(100), -- charity_registration, financial_audit, identity_check
  status VARCHAR(50), -- approved, rejected, pending_review
  notes TEXT,
  documents JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coordination Logs (for tracking duplicates, partnerships)
CREATE TABLE coordination_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  related_initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50), -- duplicate, partnership_potential, similar_cause
  confidence_score DECIMAL(3, 2), -- 0-1 confidence that these are related
  status VARCHAR(50) DEFAULT 'identified', -- identified, notified, partnered, dismissed
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(initiative_id, related_initiative_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_organisations_type ON organisations(type);
CREATE INDEX idx_organisations_verified ON organisations(is_verified);
CREATE INDEX idx_initiatives_organisation ON initiatives(organisation_id);
CREATE INDEX idx_initiatives_category ON initiatives(category);
CREATE INDEX idx_initiatives_location ON initiatives(country);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_initiative ON donations(initiative_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at);
CREATE INDEX idx_needs_initiative ON needs(initiative_id);
CREATE INDEX idx_evidence_initiative ON evidence(initiative_id);
CREATE INDEX idx_impact_updates_initiative ON impact_updates(initiative_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER organisations_updated_at BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER initiatives_updated_at BEFORE UPDATE ON initiatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER needs_updated_at BEFORE UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
