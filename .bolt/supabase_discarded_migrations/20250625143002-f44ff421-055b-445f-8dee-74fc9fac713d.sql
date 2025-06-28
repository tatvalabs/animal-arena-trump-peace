
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  role TEXT DEFAULT 'fighter' CHECK (role IN ('fighter', 'trump')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fights table
CREATE TABLE public.fights (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create animal personas enum for consistency
CREATE TYPE animal_type AS ENUM ('lion', 'owl', 'fox', 'bear', 'rabbit', 'elephant', 'wolf', 'eagle');

-- Add animal constraint to fights table
ALTER TABLE public.fights 
ADD CONSTRAINT valid_creator_animal CHECK (creator_animal IN ('lion', 'owl', 'fox', 'bear', 'rabbit', 'elephant', 'wolf', 'eagle'));

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on fights table  
ALTER TABLE public.fights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for fights
CREATE POLICY "Users can view fights they created" ON public.fights
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Users can view fights they're mediating" ON public.fights
  FOR SELECT USING (auth.uid() = mediator_id);

CREATE POLICY "Users can view pending fights for browsing" ON public.fights
  FOR SELECT USING (status = 'pending');

CREATE POLICY "Users can create fights" ON public.fights
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Fight creators can update their fights" ON public.fights
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Mediators can update fights they're resolving" ON public.fights
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance  
CREATE INDEX idx_fights_creator_id ON public.fights(creator_id);
CREATE INDEX idx_fights_mediator_id ON public.fights(mediator_id);
CREATE INDEX idx_fights_status ON public.fights(status);
CREATE INDEX idx_fights_created_at ON public.fights(created_at);
