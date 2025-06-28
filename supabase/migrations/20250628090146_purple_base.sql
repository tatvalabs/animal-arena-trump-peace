/*
  # Mediator Acceptance System

  1. Changes
    - Add trigger function to handle mediator request acceptance
    - Update fight status when both players accept a mediator
    - Add trigger for automatic status updates

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data consistency
*/

-- Update the trigger to handle both player acceptances
CREATE OR REPLACE FUNCTION public.update_mediator_request_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- When both creator and opponent accept the mediator, update status and assign mediator to fight
  IF NEW.accepted_by_creator = TRUE AND NEW.accepted_by_opponent = TRUE AND 
     (OLD.accepted_by_creator IS DISTINCT FROM TRUE OR OLD.accepted_by_opponent IS DISTINCT FROM TRUE) THEN
    NEW.status = 'approved';
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
DROP TRIGGER IF EXISTS mediator_request_acceptance_trigger ON public.mediator_requests;
CREATE TRIGGER mediator_request_acceptance_trigger
  BEFORE UPDATE ON public.mediator_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mediator_request_status();

-- Create function to handle fight acceptance
CREATE OR REPLACE FUNCTION public.update_fight_status_on_acceptance()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- When opponent accepts the fight, update status to 'accepted'
  IF NEW.opponent_accepted = TRUE AND OLD.opponent_accepted IS DISTINCT FROM TRUE THEN
    NEW.status = 'accepted';
    NEW.opponent_accepted_at = NOW();
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for fight acceptance
DROP TRIGGER IF EXISTS fight_acceptance_trigger ON public.fights;
CREATE TRIGGER fight_acceptance_trigger
  BEFORE UPDATE ON public.fights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fight_status_on_acceptance();