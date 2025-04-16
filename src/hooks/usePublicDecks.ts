
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeckCardProps } from "@/components/DeckCard";

export const usePublicDecks = () => {
  const [decks, setDecks] = useState<DeckCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const fetchPublicDecks = async () => {
    setIsLoading(true);
    setError(null);
    console.log("ExplorePage: Fetching public decks from Supabase");
    
    try {
      // Récupérer tous les decks publics
      const { data: publicDecks, error } = await supabase
        .from('decks')
        .select('*')
        .eq('is_public', true);
        
      if (error) {
        console.error("Error fetching public decks:", error);
        setError("Impossible de charger les decks publics");
        toast({
          title: "Erreur",
          description: "Impossible de charger les decks publics",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log(`ExplorePage: Found ${publicDecks.length} public decks from Supabase`);
      
      // Extraire tous les tags uniques
      const tags = new Set<string>();
      publicDecks.forEach(deck => {
        if (deck.tags && Array.isArray(deck.tags)) {
          deck.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));

      // Créer les cartes de deck pour l'affichage avec des requêtes parallèles
      const deckCardsPromises = publicDecks.map(async (deck) => {
        // Obtenir le nombre de flashcards
        const { count: cardCount } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('deck_id', deck.id);
          
        // Obtenir le nom de l'auteur
        let authorName = "Utilisateur";
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', deck.author_id)
          .maybeSingle();
          
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
      });
      
      try {
        const deckCards = await Promise.all(deckCardsPromises);
        setDecks(deckCards);
      } catch (err) {
        console.error("Error processing deck data:", err);
        toast({
          title: "Avertissement",
          description: "Certaines informations de decks n'ont pas pu être chargées",
          variant: "default",
        });
        // Continue with whatever data we have
      }

      setLastFetch(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Une erreur inattendue s'est produite");
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log("Setting up realtime subscription for public decks");
    
    const channel = supabase
      .channel('public-decks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decks' },
        (payload) => {
          console.log('Deck change detected:', payload);
          
          // Si un deck a été rendu public ou un nouveau deck public a été créé
          if (
            (payload.eventType === 'INSERT' && payload.new?.is_public) || 
            (payload.eventType === 'UPDATE' && 
             payload.new?.is_public && 
             (!payload.old?.is_public))
          ) {
            toast({
              title: "Nouveaux decks disponibles",
              description: "Un nouveau deck public a été ajouté",
            });
            fetchPublicDecks();
          }
          
          // Si un deck public a été rendu privé ou supprimé
          if (
            (payload.eventType === 'UPDATE' && 
             !payload.new?.is_public && 
             payload.old?.is_public) || 
            (payload.eventType === 'DELETE' && 
             payload.old?.is_public)
          ) {
            fetchPublicDecks();
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Return unsubscribe function
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  };

  // Fetch decks on component mount and setup subscription
  useEffect(() => {
    fetchPublicDecks();
    
    // Set up realtime subscription
    const unsubscribe = setupRealtimeSubscription();
    
    // Auto refresh every 5 minutes to ensure data freshness
    const intervalId = setInterval(() => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (lastFetch < fiveMinutesAgo) {
        console.log("Auto-refreshing decks after 5 minutes");
        fetchPublicDecks();
      }
    }, 60000); // Check every minute
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return { 
    decks, 
    isLoading, 
    error, 
    allTags, 
    fetchPublicDecks,
    lastFetch
  };
};
