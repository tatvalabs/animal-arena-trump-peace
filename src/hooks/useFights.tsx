import { useEffect, useState, useCallback } from 'react';
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

  const fetchFights = useCallback(async () => {
    if (!user) {
      setFights([]);
      setLoading(false);
      return;
    }

    console.log('Fetching fights for user:', user.id, user.email);
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
          updated_at: fight.updated_at || fight.created_at,
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
  }, [user]);

  useEffect(() => {
    fetchFights();
  }, [fetchFights]);

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
    if (!user) {
      console.error('No user found for fight acceptance');
      return { error: new Error('No user authenticated') };
    }

    console.log('Accepting fight invitation:', { fightId, opponentAnimal, userId: user.id, userEmail: user.email });

    try {
      // First verify the fight exists and user is invited
      const { data: currentFight, error: fetchError } = await supabase
        .from('fights')
        .select('*')
        .eq('id', fightId)
        .single();

      if (fetchError) {
        console.error('Error fetching current fight:', fetchError);
        return { error: fetchError };
      }

      if (!currentFight) {
        console.error('Fight not found');
        return { error: new Error('Fight not found') };
      }

      // Check if user is actually invited to this fight
      if (currentFight.opponent_email !== user.email) {
        console.error('User not invited to this fight', { 
          fightOpponentEmail: currentFight.opponent_email, 
          userEmail: user.email 
        });
        return { error: new Error('You are not invited to this fight') };
      }

      if (currentFight.opponent_accepted) {
        console.error('Fight already accepted');
        return { error: new Error('Fight invitation already accepted') };
      }

      console.log('Current fight data before update:', currentFight);

      // Update the fight with opponent acceptance
      const updateData = { 
        opponent_accepted: true,
        opponent_animal: opponentAnimal,
        status: 'accepted',
        opponent_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Updating fight with data:', updateData);

      const { data: updatedRows, error: updateError } = await supabase
        .from('fights')
        .update(updateData)
        .eq('id', fightId)
        .select();

      if (updateError) {
        console.error('Fight acceptance update error:', updateError);
        return { error: updateError };
      }

      if (!updatedRows || updatedRows.length === 0) {
        console.error('No rows updated - fight may not exist or permission denied');
        return { error: new Error('Failed to update fight - no rows affected') };
      }

      if (updatedRows.length > 1) {
        console.error('Multiple rows updated - this should not happen');
        return { error: new Error('Multiple fights updated - data inconsistency') };
      }

      const updatedFight = updatedRows[0];
      console.log('Fight updated successfully:', updatedFight);

      // Create activity record
      try {
        const { error: activityError } = await supabase
          .from('fight_activities')
          .insert([{
            fight_id: fightId,
            user_id: user.id,
            activity_type: 'fight_accepted',
            message: `💪 Accepted fight invitation as ${opponentAnimal}! The battle begins! ⚔️`
          }]);

        if (activityError) {
          console.error('Error creating activity (non-blocking):', activityError);
        }
      } catch (activityErr) {
        console.error('Activity creation failed (non-blocking):', activityErr);
      }

      // Force immediate refresh of all fight data
      await fetchFights();
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error accepting fight:', error);
      return { error: error as Error };
    }
  };

  const takeFight = async (fightId: string) => {
    if (!user) return { error: new Error('No user') };

    console.log('Taking fight as mediator:', fightId);

    try {
      const updateData = { 
        mediator_id: user.id,
        status: 'in-progress',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fights')
        .update(updateData)
        .eq('id', fightId);

      if (error) {
        console.error('Take fight error:', error);
        return { error };
      }

      // Force immediate refresh
      await fetchFights();
      return { error: null };
    } catch (error) {
      console.error('Unexpected error taking fight:', error);
      return { error: error as Error };
    }
  };

  const resolveFight = async (fightId: string, resolution: string) => {
    if (!user) return { error: new Error('No user') };

    console.log('Resolving fight:', fightId, resolution);

    try {
      const updateData = { 
        resolution,
        status: 'resolved',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fights')
        .update(updateData)
        .eq('id', fightId);

      if (error) {
        console.error('Resolve fight error:', error);
        return { error };
      }

      // Force immediate refresh
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