
-- Add columns to track individual player acceptance for mediator requests
ALTER TABLE public.mediator_requests 
ADD COLUMN IF NOT EXISTS accepted_by_creator boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_by_opponent boolean DEFAULT false;

-- Update the trigger to handle both player acceptances
CREATE OR REPLACE FUNCTION public.update_mediator_request_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- When both creator and opponent accept the mediator, update status and assign mediator to fight
  IF NEW.accepted_by_creator = TRUE AND NEW.accepted_by_opponent = TRUE AND 
     (OLD.accepted_by_creator IS DISTINCT FROM TRUE OR OLD.accepted_by_opponent IS DISTINCT FROM TRUE) THEN
    NEW.status = 'accepted';
    NEW.accepted_at = NOW();
    
    -- Update the fight to assign the mediator
    UPDATE public.fights 
    SET mediator_id = NEW.mediator_id, 
        status = 'in-progress',
        updated_at = NOW()
    WHERE id = NEW.fight_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for mediator request updates
DROP TRIGGER IF EXISTS trigger_update_mediator_request_status ON public.mediator_requests;
CREATE TRIGGER trigger_update_mediator_request_status
  BEFORE UPDATE ON public.mediator_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mediator_request_status();

-- Add activity type for mediator acceptance
ALTER TABLE public.fight_activities 
DROP CONSTRAINT IF EXISTS fight_activities_activity_type_check;

ALTER TABLE public.fight_activities 
ADD CONSTRAINT fight_activities_activity_type_check 
CHECK (activity_type IN ('created', 'fight_accepted', 'mediation_request', 'mediator_accepted_by_creator', 'mediator_accepted_by_opponent', 'mediation_approved', 'mediation_rejected', 'resolved', 'comment', 'moderation_action'));
