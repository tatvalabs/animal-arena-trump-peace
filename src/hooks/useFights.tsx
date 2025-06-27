
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
  opponent_accepted: boolean | null;
  opponent_accepted_at: string | null;
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
    setLoading(true);

    try {
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
        const fightsData = data?.map(fight => ({
          id: fight.id,
          title: fight.title,
          description: fight.description,
          creator_id: fight.creator_id,
          opponent_email: fight.opponent_email,
          creator_animal: fight.creator_animal,
          opponent_animal: fight.opponent_animal,
          status: fight.status,
          mediator_id: fight.mediator_id,
          resolution: fight.resolution,
          opponent_accepted: fight.opponent_accepted,
          opponent_accepted_at: fight.opponent_accepted_at,
          created_at: fight.created_at,
          updated_at: fight.updated_at,
          profiles: fight.profiles,
          mediator_profile: fight.mediator_profile
        })) || [];
        setFights(fightsData);
      }
    } catch (error) {
      console.error('Unexpected error fetching fights:', error);
      setFights([]);
    } finally {
      setLoading(false);
    }
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

    try {
      const { data, error } = await supabase
        .from('fights')
        .insert([{
          ...fightData,
          creator_id: user.id,
          status: 'pending',
          opponent_accepted: false
        }])
        .select()
        .single();

      console.log('Fight creation result:', { data, error });

      if (error) {
        console.error('Fight creation error:', error);
        return { data: null, error };
      }

      await fetchFights();
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error creating fight:', error);
      return { data: null, error: error as Error };
    }
  };

  const acceptFightInvitation = async (fightId: string, opponentAnimal: string) => {
    if (!user) return { error: new Error('No user') };

    console.log('Accepting fight invitation:', fightId, opponentAnimal);

    try {
      // First, get the current fight data to check if it's still pending
      const { data: currentFight, error: fetchError } = await supabase
        .from('fights')
        .select('*')
        .eq('id', fightId)
        .single();

      if (fetchError) {
        console.error('Error fetching current fight:', fetchError);
        return { error: fetchError };
      }

      console.log('Current fight data:', currentFight);

      // Update the fight with opponent acceptance
      const { data: updatedFight, error: updateError } = await supabase
        .from('fights')
        .update({ 
          opponent_accepted: true,
          opponent_animal: opponentAnimal,
          status: 'accepted',
          opponent_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', fightId)
        .select()
        .single();

      if (updateError) {
        console.error('Fight acceptance error:', updateError);
        return { error: updateError };
      }

      console.log('Fight updated successfully:', updatedFight);

      // Create activity record
      const { error: activityError } = await supabase
        .from('fight_activities')
        .insert([{
          fight_id: fightId,
          user_id: user.id,
          activity_type: 'fight_accepted',
          message: `💪 Accepted fight invitation as ${opponentAnimal}! The battle begins! ⚔️`
        }]);

      if (activityError) {
        console.error('Error creating activity:', activityError);
      }

      // Force refetch fights to ensure UI updates
      await fetchFights();
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error accepting fight:', error);
      return { error: error as Error };
    }
  };

  const takeFight = async (fightId: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('fights')
        .update({ 
          mediator_id: user.id,
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', fightId);

      if (error) {
        console.error('Take fight error:', error);
        return { error };
      }

      await fetchFights();
      return { error: null };
    } catch (error) {
      console.error('Unexpected error taking fight:', error);
      return { error: error as Error };
    }
  };

  const resolveFight = async (fightId: string, resolution: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('fights')
        .update({ 
          resolution,
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', fightId);

      if (error) {
        console.error('Resolve fight error:', error);
        return { error };
      }

      await fetchFights();
      return { error: null };
    } catch (error) {
      console.error('Unexpected error resolving fight:', error);
      return { error: error as Error };
    }
  };

  return {
    fights,
    loading,
    createFight,
    acceptFightInvitation,
    takeFight,
    resolveFight,
    refetch: fetchFights
  };
};
