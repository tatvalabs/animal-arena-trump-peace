
-- Create a table for mediator proposals/requests
CREATE TABLE public.mediator_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fight_id UUID REFERENCES public.fights(id) ON DELETE CASCADE NOT NULL,
  mediator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proposal_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  creator_response TEXT,
  opponent_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_mediator_requests_fight_id ON public.mediator_requests(fight_id);
CREATE INDEX idx_mediator_requests_mediator_id ON public.mediator_requests(mediator_id);
CREATE INDEX idx_mediator_requests_status ON public.mediator_requests(status);

-- Enable RLS
ALTER TABLE public.mediator_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mediator_requests
CREATE POLICY "Users can view mediator requests for their fights" ON public.mediator_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = mediator_requests.fight_id 
      AND (fights.creator_id = auth.uid() OR fights.mediator_id = auth.uid())
    )
  );

CREATE POLICY "Users can view their own mediator requests" ON public.mediator_requests
  FOR SELECT USING (auth.uid() = mediator_id);

CREATE POLICY "Users can create mediator requests" ON public.mediator_requests
  FOR INSERT WITH CHECK (auth.uid() = mediator_id);

CREATE POLICY "Fight creators can update mediator requests" ON public.mediator_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = mediator_requests.fight_id 
      AND fights.creator_id = auth.uid()
    )
  );

-- Add a table for fight activity/timeline
CREATE TABLE public.fight_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fight_id UUID REFERENCES public.fights(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'mediation_request', 'mediation_approved', 'mediation_rejected', 'resolved', 'comment')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_fight_activities_fight_id ON public.fight_activities(fight_id);
CREATE INDEX idx_fight_activities_user_id ON public.fight_activities(user_id);
CREATE INDEX idx_fight_activities_created_at ON public.fight_activities(created_at);

-- Enable RLS
ALTER TABLE public.fight_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fight_activities
CREATE POLICY "Users can view activities for fights they're involved in" ON public.fight_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fights 
      WHERE fights.id = fight_activities.fight_id 
      AND (fights.creator_id = auth.uid() OR fights.mediator_id = auth.uid())
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can create activities" ON public.fight_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
