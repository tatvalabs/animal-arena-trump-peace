/*
  # Mediator System Enhancement

  1. New Tables
    - `mediator_requests`
      - `id` (uuid, primary key)
      - `fight_id` (uuid, references fights)
      - `mediator_id` (uuid, references profiles)
      - `proposal_message` (text)
      - `status` (text, default 'pending')
      - `creator_response` (text)
      - `opponent_response` (text)
      - `accepted_by_creator` (boolean, default false)
      - `accepted_by_opponent` (boolean, default false)
      - `accepted_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `fight_activities`
      - `id` (uuid, primary key)
      - `fight_id` (uuid, references fights)
      - `user_id` (uuid, references profiles)
      - `activity_type` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add appropriate policies for mediator system
*/

-- Create a table for mediator proposals/requests
CREATE TABLE IF NOT EXISTS public.mediator_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fight_id UUID REFERENCES public.fights(id) ON DELETE CASCADE NOT NULL,
  mediator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proposal_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  creator_response TEXT,
  opponent_response TEXT,
  accepted_by_creator BOOLEAN DEFAULT false,
  accepted_by_opponent BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_mediator_requests_fight_id ON public.mediator_requests(fight_id);
CREATE INDEX IF NOT EXISTS idx_mediator_requests_mediator_id ON public.mediator_requests(mediator_id);
CREATE INDEX IF NOT EXISTS idx_mediator_requests_status ON public.mediator_requests(status);

-- Enable RLS
ALTER TABLE public.mediator_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mediator_requests
DROP POLICY IF EXISTS "Users can view mediator requests for their fights" ON public.mediator_requests;
CREATE POLICY "Users can view mediator requests for their fights" ON public.mediator_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = mediator_requests.fight_id 
      AND (fights.creator_id = auth.uid() OR fights.mediator_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view their own mediator requests" ON public.mediator_requests;
CREATE POLICY "Users can view their own mediator requests" ON public.mediator_requests
  FOR SELECT USING (auth.uid() = mediator_id);

DROP POLICY IF EXISTS "Users can create mediator requests" ON public.mediator_requests;
CREATE POLICY "Users can create mediator requests" ON public.mediator_requests
  FOR INSERT WITH CHECK (auth.uid() = mediator_id);

DROP POLICY IF EXISTS "Fight creators can update mediator requests" ON public.mediator_requests;
CREATE POLICY "Fight creators can update mediator requests" ON public.mediator_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = mediator_requests.fight_id 
      AND fights.creator_id = auth.uid()
    )
  );

-- Add a table for fight activity/timeline
CREATE TABLE IF NOT EXISTS public.fight_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fight_id UUID REFERENCES public.fights(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'fight_accepted', 'mediation_request', 'mediator_accepted_by_creator', 'mediator_accepted_by_opponent', 'mediation_approved', 'mediation_rejected', 'resolved', 'comment', 'moderation_action')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_fight_activities_fight_id ON public.fight_activities(fight_id);
CREATE INDEX IF NOT EXISTS idx_fight_activities_user_id ON public.fight_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_fight_activities_created_at ON public.fight_activities(created_at);

-- Enable RLS
ALTER TABLE public.fight_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fight_activities
DROP POLICY IF EXISTS "Users can view activities for fights they're involved in" ON public.fight_activities;
CREATE POLICY "Users can view activities for fights they're involved in" ON public.fight_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = fight_activities.fight_id 
      AND (fights.creator_id = auth.uid() OR fights.mediator_id = auth.uid())
    ) OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can create activities" ON public.fight_activities;
CREATE POLICY "Users can create activities" ON public.fight_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);