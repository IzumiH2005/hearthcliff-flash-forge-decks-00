
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeckCardProps } from "@/components/DeckCard";

export const usePublicDecks = () => {
  const [decks, setDecks] = useState<DeckCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchPublicDecks = async () => {
    setIsLoading(true);
    console.log("ExplorePage: Fetching public decks from Supabase");
    
    try {
      const { data: publicDecks, error } = await supabase
        .from('decks')
        .select('*')
        .eq('is_public', true);
        
      if (error) {
        console.error("Error fetching public decks:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les decks publics",
          variant: "destructive",
        });
        return;
      }

      console.log(`ExplorePage: Found ${publicDecks.length} public decks from Supabase`);
      
      // Extract all unique tags
      const tags = new Set<string>();
      publicDecks.forEach(deck => {
        if (deck.tags && Array.isArray(deck.tags)) {
          deck.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));

      // Create deck cards for display
      const deckCards = await Promise.all(publicDecks.map(async (deck) => {
        // Get flashcards count
        const { count: cardCount } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('deck_id', deck.id);
          
        // Get author name
        let authorName = "Utilisateur";
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', deck.author_id)
          .single();
          
        if (profile && profile.username) {
          authorName = profile.username;
        }
          
        return {
          id: deck.id,
          title: deck.title,
          description: deck.description || "",
          coverImage: deck.cover_image,
          cardCount: cardCount || 0,
          tags: deck.tags || [],
          author: authorName,
          isPublic: deck.is_public,
        };
      }));

      setDecks(deckCards);
      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('public-decks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decks' },
        (payload) => {
          console.log('Deck change detected:', payload);
          
          // If a deck was made public or a new public deck was created
          if (
            (payload.eventType === 'INSERT' && payload.new.is_public) || 
            (payload.eventType === 'UPDATE' && payload.new.is_public && (!payload.old.is_public))
          ) {
            toast({
              title: "Nouveaux decks disponibles",
              description: "Un nouveau deck public a été ajouté",
            });
            fetchPublicDecks();
          }
          
          // If a public deck was made private or deleted
          if (
            (payload.eventType === 'UPDATE' && !payload.new.is_public && payload.old.is_public) || 
            (payload.eventType === 'DELETE' && payload.old.is_public)
          ) {
            fetchPublicDecks();
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchPublicDecks();
    
    // Set up realtime subscription
    const unsubscribe = setupRealtimeSubscription();
    
    return () => {
      unsubscribe();
    };
  }, []);

  return { decks, isLoading, allTags, fetchPublicDecks };
};
