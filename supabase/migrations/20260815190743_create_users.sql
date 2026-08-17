-- ==============================================================================
-- HackNect Complete Supabase Database Schema & Storage Setup
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. Tables
-- ==============================================================================

-- 3.1 USERS TABLE (Synced with Clerk)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users (clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3.2 HACKATHONS TABLE
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    team_min INTEGER DEFAULT 1,
    team_max INTEGER DEFAULT 4,
    top_n_selections INTEGER,
    registration_deadline TIMESTAMPTZ,
    venue TEXT,
    prizes TEXT,
    timeline TEXT,
    banner_url TEXT,
    pfp_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Explicit foreign key constraint name used by PostgREST: users!hackathons_creator_id_fkey
    CONSTRAINT hackathons_creator_id_fkey FOREIGN KEY (creator_id) 
        REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hackathons_creator_id ON public.hackathons (creator_id);
CREATE INDEX IF NOT EXISTS idx_hackathons_deadline ON public.hackathons (registration_deadline);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_at ON public.hackathons (created_at DESC);

CREATE TRIGGER set_hackathons_updated_at
    BEFORE UPDATE ON public.hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3.3 REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL,
    team_leader_id UUID NOT NULL,
    team_name TEXT NOT NULL,
    teammates UUID[] NOT NULL DEFAULT '{}'::UUID[],
    invite_code VARCHAR(10) UNIQUE,
    idea_pdf_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Explicit foreign key constraint name used by PostgREST: users!registrations_team_leader_id_fkey
    CONSTRAINT registrations_hackathon_id_fkey FOREIGN KEY (hackathon_id) 
        REFERENCES public.hackathons(id) ON DELETE CASCADE,
    CONSTRAINT registrations_team_leader_id_fkey FOREIGN KEY (team_leader_id) 
        REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_registrations_hackathon_id ON public.registrations (hackathon_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team_leader_id ON public.registrations (team_leader_id);
CREATE INDEX IF NOT EXISTS idx_registrations_invite_code ON public.registrations (invite_code);
CREATE INDEX IF NOT EXISTS idx_registrations_idea_pdf_url ON public.registrations (idea_pdf_url);
CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at ON public.registrations (submitted_at DESC);

-- GIN index for high-speed array containment checks: teammates.cs.{userData.id}
CREATE INDEX IF NOT EXISTS idx_registrations_teammates_gin ON public.registrations USING GIN (teammates);

CREATE TRIGGER set_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3.4 SHORTLISTS TABLE (AI Selection Results)
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL,
    registration_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT shortlists_hackathon_id_fkey FOREIGN KEY (hackathon_id) 
        REFERENCES public.hackathons(id) ON DELETE CASCADE,
    CONSTRAINT shortlists_registration_id_fkey FOREIGN KEY (registration_id) 
        REFERENCES public.registrations(id) ON DELETE CASCADE,
    CONSTRAINT shortlists_hackathon_registration_unique UNIQUE (hackathon_id, registration_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_hackathon_id ON public.shortlists (hackathon_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_registration_id ON public.shortlists (registration_id);


-- 3.5 TEAMS TABLE (Extended Team Model)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID,
    name TEXT NOT NULL,
    invite_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT teams_hackathon_id_fkey FOREIGN KEY (hackathon_id) 
        REFERENCES public.hackathons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teams_hackathon_id ON public.teams (hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams (invite_code);

CREATE TRIGGER set_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3.6 TEAM_MEMBERS TABLE (Extended Team Model)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES public.teams(id) ON DELETE CASCADE,
    CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT team_members_team_user_unique UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members (user_id);


-- ==============================================================================
-- 4. Storage Buckets Setup & Access Policies
-- ==============================================================================

-- Create 'hackathons' bucket (for banners and profile images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathons', 'hackathons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create 'registrations' bucket (for project PDF uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('registrations', 'registrations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Read Policies (Public)
CREATE POLICY "Public Access for Hackathons Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'hackathons');

CREATE POLICY "Public Access for Registrations Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'registrations');

-- Storage Write Policies
CREATE POLICY "Allow All Insert on Hackathons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hackathons');

CREATE POLICY "Allow All Update on Hackathons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hackathons');

CREATE POLICY "Allow All Delete on Hackathons"
ON storage.objects FOR DELETE
USING (bucket_id = 'hackathons');

CREATE POLICY "Allow All Insert on Registrations"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'registrations');

CREATE POLICY "Allow All Update on Registrations"
ON storage.objects FOR UPDATE
USING (bucket_id = 'registrations');

CREATE POLICY "Allow All Delete on Registrations"
ON storage.objects FOR DELETE
USING (bucket_id = 'registrations');


-- ==============================================================================
-- 5. Row Level Security (RLS) & Table Access Policies
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read hackathons" ON public.hackathons FOR SELECT USING (true);
CREATE POLICY "Allow public read registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow public read shortlists" ON public.shortlists FOR SELECT USING (true);
CREATE POLICY "Allow public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read team_members" ON public.team_members FOR SELECT USING (true);

-- Full Access / Service Role Policies
CREATE POLICY "Allow full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access hackathons" ON public.hackathons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access shortlists" ON public.shortlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
