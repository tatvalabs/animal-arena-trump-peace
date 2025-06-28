
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view relevant fights" ON public.fights;
DROP POLICY IF EXISTS "Creators can update their fights" ON public.fights;
DROP POLICY IF EXISTS "Invited opponents can accept fights" ON public.fights;
DROP POLICY IF EXISTS "Mediators can update their fights" ON public.fights;

-- Enable RLS on fights table if not already enabled
ALTER TABLE public.fights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view fights they are part of (creator, opponent, or mediator)
CREATE POLICY "Users can view relevant fights" ON public.fights
FOR SELECT USING (
  creator_id = auth.uid() OR 
  opponent_email = auth.email() OR 
  mediator_id = auth.uid()
);

-- Create policy to allow fight creators to update their fights
CREATE POLICY "Creators can update their fights" ON public.fights
FOR UPDATE USING (creator_id = auth.uid());

-- Create policy to allow invited opponents to accept fights
CREATE POLICY "Invited opponents can accept fights" ON public.fights
FOR UPDATE USING (
  opponent_email = auth.email() AND 
  opponent_accepted IS NOT TRUE
);

-- Create policy to allow mediators to update fights they mediate
CREATE POLICY "Mediators can update their fights" ON public.fights
FOR UPDATE USING (mediator_id = auth.uid());
