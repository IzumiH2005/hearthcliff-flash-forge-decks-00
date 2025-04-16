
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Filter, X } from "lucide-react";
import DeckCard, { DeckCardProps } from "@/components/DeckCard";
import { getDecks, getFlashcardsByDeck, Deck, getUser } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ExplorePage = () => {
  const [decks, setDecks] = useState<DeckCardProps[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<DeckCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    filterDecks();
  }, [searchTerm, activeFilters, decks]);

  const filterDecks = () => {
    let result = [...decks];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        deck => 
          deck.title.toLowerCase().includes(term) || 
          deck.description.toLowerCase().includes(term) ||
          deck.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (activeFilters.length > 0) {
      result = result.filter(deck => 
        activeFilters.some(filter => deck.tags.includes(filter))
      );
    }

    setFilteredDecks(result);
  };

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters([]);
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explorer les Decks</h1>
          <p className="text-muted-foreground">
            Découvrez et importez des decks de flashcards créés par la communauté
          </p>
        </div>
        <Button
          onClick={fetchPublicDecks}
          variant="outline"
          className="self-start md:self-auto"
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "Actualiser"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des decks..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {activeFilters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center mr-2">
          <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>
        {allTags.map(tag => (
          <Badge
            key={tag}
            variant={activeFilters.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Chargement des decks...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
            <TabsTrigger value="popular">Populaires</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDecks.map((deck) => (
                  <DeckCard key={deck.id} {...deck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Aucun deck ne correspond à votre recherche
                </p>
                <Button variant="link" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks
                .sort((a, b) => {
                  // Pour le tri par date, on utilise l'ID comme approximation
                  // car UUID contient un composant temporel
                  return b.id.localeCompare(a.id);
                })
                .map((deck) => (
                  <DeckCard key={deck.id} {...deck} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks
                .sort((a, b) => b.cardCount - a.cardCount)
                .map((deck) => (
                  <DeckCard key={deck.id} {...deck} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ExplorePage;
