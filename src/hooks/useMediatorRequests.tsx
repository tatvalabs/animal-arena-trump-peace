
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
  created_at: string;
  updated_at: string;
  fights?: {
    title: string;
    creator_id: string;
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
        fights(title, creator_id),
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
          message: `Proposed mediation: ${proposalMessage}`
        }]);
    }

    return { data, error };
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
    refetch: fetchRequests
  };
};
