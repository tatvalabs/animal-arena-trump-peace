
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MediatorRequest {
  id: string;
  fight_id: string;
  mediator_id: string;
  proposal_message: string;
  status: string;
  creator_response: string | null;
  opponent_response: string | null;
  accepted_by_creator: boolean | null;
  accepted_by_opponent: boolean | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  fights?: {
    title: string;
    creator_id: string;
    opponent_user_id: string | null;
    opponent_email: string | null;
  };
  profiles?: {
    username: string | null;
    email: string | null;
  };
}

export const useMediatorRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MediatorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mediator_requests')
      .select(`
        *,
        fights(title, creator_id, opponent_user_id, opponent_email),
        profiles(username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mediator requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const createRequest = async (fightId: string, proposalMessage: string) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('mediator_requests')
      .insert([{
        fight_id: fightId,
        mediator_id: user.id,
        proposal_message: proposalMessage
      }])
      .select()
      .single();

    if (!error) {
      await fetchRequests();
      
      // Create activity record
      await supabase
        .from('fight_activities')
        .insert([{
          fight_id: fightId,
          user_id: user.id,
          activity_type: 'mediation_request',
          message: `🦅 Proposed mediation: ${proposalMessage}`
        }]);
    }

    return { data, error };
  };

  const acceptMediatorRequest = async (requestId: string, isCreator: boolean) => {
    if (!user) return { error: new Error('No user') };

    const updateData = isCreator 
      ? { accepted_by_creator: true }
      : { accepted_by_opponent: true };

    const { error } = await supabase
      .from('mediator_requests')
      .update(updateData)
      .eq('id', requestId);

    if (!error) {
      await fetchRequests();
      
      // Get the request details for activity logging
      const { data: requestData } = await supabase
        .from('mediator_requests')
        .select('fight_id')
        .eq('id', requestId)
        .single();

      if (requestData) {
        await supabase
          .from('fight_activities')
          .insert([{
            fight_id: requestData.fight_id,
            user_id: user.id,
            activity_type: isCreator ? 'mediator_accepted_by_creator' : 'mediator_accepted_by_opponent',
            message: `✅ ${isCreator ? 'Creator' : 'Opponent'} accepted mediator proposal`
          }]);
      }
    }

    return { error };
  };

  const respondToRequest = async (requestId: string, response: 'approved' | 'rejected') => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('mediator_requests')
      .update({ 
        status: response,
        creator_response: response
      })
      .eq('id', requestId);

    if (!error) {
      await fetchRequests();
    }

    return { error };
  };

  return {
    requests,
    loading,
    createRequest,
    respondToRequest,
    acceptMediatorRequest,
    refetch: fetchRequests
  };
};
