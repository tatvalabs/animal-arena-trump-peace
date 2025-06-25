
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  opponent_email: string | null;
  creator_animal: string;
  opponent_animal: string | null;
  status: string;
  mediator_id: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    email: string | null;
  };
  mediator_profile?: {
    username: string | null;
    email: string | null;
  };
}

export const useFights = () => {
  const { user } = useAuth();
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFights();
    }
  }, [user]);

  const fetchFights = async () => {
    if (!user) return;

    console.log('Fetching fights for user:', user.id);

    // Fetch all fights for timeline and browsing
    const { data, error } = await supabase
      .from('fights')
      .select(`
        *,
        profiles!creator_id(username, email),
        mediator_profile:profiles!mediator_id(username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fights:', error);
      setFights([]);
    } else {
      console.log('Fetched fights:', data);
      setFights(data || []);
    }
    setLoading(false);
  };

  const createFight = async (fightData: {
    title: string;
    description: string;
    opponent_email?: string;
    creator_animal: string;
  }) => {
    if (!user) return { error: new Error('No user') };

    console.log('Creating fight with data:', fightData);
    console.log('User ID:', user.id);

    const { data, error } = await supabase
      .from('fights')
      .insert([{
        ...fightData,
        creator_id: user.id
      }])
      .select()
      .single();

    console.log('Fight creation result:', { data, error });

    if (!error) {
      await fetchFights();
    }

    return { data, error };
  };

  const takeFight = async (fightId: string) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('fights')
      .update({ 
        mediator_id: user.id,
        status: 'in-progress'
      })
      .eq('id', fightId);

    if (!error) {
      await fetchFights();
    }

    return { error };
  };

  const resolveFight = async (fightId: string, resolution: string) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('fights')
      .update({ 
        resolution,
        status: 'resolved'
      })
      .eq('id', fightId);

    if (!error) {
      await fetchFights();
    }

    return { error };
  };

  return {
    fights,
    loading,
    createFight,
    takeFight,
    resolveFight,
    refetch: fetchFights
  };
};
