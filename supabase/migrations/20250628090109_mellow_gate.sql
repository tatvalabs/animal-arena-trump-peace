/*
  # Initial Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `username` (text)
      - `role` (text, default 'fighter')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `fights`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `creator_id` (uuid, references profiles)
      - `opponent_email` (text)
      - `creator_animal` (text)
      - `opponent_animal` (text)
      - `status` (text, default 'pending')
      - `mediator_id` (uuid, references profiles)
      - `resolution` (text)
      - `opponent_accepted` (boolean, default false)
      - `opponent_accepted_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Create trigger for new user profile creation
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  role TEXT DEFAULT 'fighter' CHECK (role IN ('fighter', 'trump')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fights table
CREATE TABLE IF NOT EXISTS public.fights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_email TEXT,
  creator_animal TEXT NOT NULL,
  opponent_animal TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'resolved')),
  mediator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution TEXT,
  opponent_accepted BOOLEAN DEFAULT false,
  opponent_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create animal personas enum for consistency
DO $$ BEGIN
  CREATE TYPE animal_type AS ENUM ('lion', 'owl', 'fox', 'bear', 'rabbit', 'elephant', 'wolf', 'eagle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add animal constraint to fights table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_creator_animal' AND table_name = 'fights'
  ) THEN
    ALTER TABLE public.fights 
    ADD CONSTRAINT valid_creator_animal CHECK (creator_animal IN ('lion', 'owl', 'fox', 'bear', 'rabbit', 'elephant', 'wolf', 'eagle'));
  END IF;
END $$;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on fights table  
ALTER TABLE public.fights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for fights
DROP POLICY IF EXISTS "Users can view fights they created" ON public.fights;
CREATE POLICY "Users can view fights they created" ON public.fights
  FOR SELECT USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can view fights they're mediating" ON public.fights;
CREATE POLICY "Users can view fights they're mediating" ON public.fights
  FOR SELECT USING (auth.uid() = mediator_id);

DROP POLICY IF EXISTS "Users can view pending fights for browsing" ON public.fights;
CREATE POLICY "Users can view pending fights for browsing" ON public.fights
  FOR SELECT USING (status = 'pending');

DROP POLICY IF EXISTS "Users can view relevant fights" ON public.fights;
CREATE POLICY "Users can view relevant fights" ON public.fights
  FOR SELECT USING (
    creator_id = auth.uid() OR 
    opponent_email = auth.email() OR 
    mediator_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create fights" ON public.fights;
CREATE POLICY "Users can create fights" ON public.fights
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update their fights" ON public.fights;
CREATE POLICY "Creators can update their fights" ON public.fights
  FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Invited opponents can accept fights" ON public.fights;
CREATE POLICY "Invited opponents can accept fights" ON public.fights
  FOR UPDATE USING (
    opponent_email = auth.email() AND 
    opponent_accepted IS NOT TRUE
  );

DROP POLICY IF EXISTS "Mediators can update their fights" ON public.fights;
CREATE POLICY "Mediators can update their fights" ON public.fights
  FOR UPDATE USING (auth.uid() = mediator_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance  
CREATE INDEX IF NOT EXISTS idx_fights_creator_id ON public.fights(creator_id);
CREATE INDEX IF NOT EXISTS idx_fights_mediator_id ON public.fights(mediator_id);
CREATE INDEX IF NOT EXISTS idx_fights_status ON public.fights(status);
CREATE INDEX IF NOT EXISTS idx_fights_created_at ON public.fights(created_at);