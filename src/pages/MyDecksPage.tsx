
import { useState, useEffect } from 'react';
import { getDecks, type Deck } from '@/lib/localStorage';
import { getUser } from '@/lib/localStorage';
import DeckCard from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Plus, RefreshCcw, LayoutGrid, Columns, Rows } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const MyDecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [user, setUser] = useState(getUser());
  const location = useLocation();
  const { toast } = useToast();
  const [gridLayout, setGridLayout] = useState<"1" | "2" | "3" | "4">(
    () => localStorage.getItem("deckGridLayout") as "1" | "2" | "3" | "4" || "3"
  );

  // Function to refresh decks
  const refreshDecks = () => {
    // Force get latest user and decks data from localStorage
    const currentUser = getUser();
    setUser(currentUser);
    
    // Get fresh deck data
    const allDecks = getDecks();
    const userDecks = allDecks.filter(deck => deck.authorId === currentUser?.id);
    
    console.log('Refreshing decks for user:', currentUser?.id);
    console.log('Found decks:', userDecks.length);
    
    setDecks(userDecks);
    toast({
      title: "Liste mise à jour",
      description: `${userDecks.length} deck(s) trouvé(s)`,
    });
  };

  // Refresh when navigation happens
  useEffect(() => {
    // Always get the latest user when the component mounts or updates
    const currentUser = getUser();
    setUser(currentUser);
    
    // Filtrer uniquement les decks de l'utilisateur connecté
    const userDecks = getDecks().filter(deck => deck.authorId === currentUser?.id);
    console.log('Navigation refresh - User ID:', currentUser?.id);
    console.log('Navigation refresh - Decks found:', userDecks.length);
    setDecks(userDecks);
  }, [location.key]); // React to navigation changes

  // Additional periodic refresh for better sync on published site
  useEffect(() => {
    // Initial load
    const initialUser = getUser();
    console.log('Initial load - User ID:', initialUser?.id);
    const initialDecks = getDecks().filter(deck => deck.authorId === initialUser?.id);
    console.log('Initial load - Decks found:', initialDecks.length);
    setDecks(initialDecks);
    
    // First refresh after a short delay
    const initialRefreshTimeout = setTimeout(() => {
      refreshDecks();
    }, 1000);
    
    // Set up an interval to check for updates more frequently
    const intervalId = setInterval(() => {
      const latestUser = getUser();
      if (latestUser) {
        const freshDecks = getDecks().filter(deck => deck.authorId === latestUser.id);
        if (JSON.stringify(freshDecks) !== JSON.stringify(decks)) {
          setDecks(freshDecks);
        }
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      clearTimeout(initialRefreshTimeout);
      clearInterval(intervalId);
    };
  }, []);
  
  // Grid layout handling
  const handleLayoutChange = (value: string) => {
    if (value) {
      const newLayout = value as "1" | "2" | "3" | "4";
      setGridLayout(newLayout);
      localStorage.setItem("deckGridLayout", newLayout);
      
      toast({
        title: "Mise en page modifiée",
        description: `Affichage avec ${newLayout} colonne${newLayout !== "1" ? "s" : ""}`,
      });
    }
  };
  
  const getGridClasses = () => {
    switch (gridLayout) {
      case "1": return "grid-cols-1";
      case "2": return "grid-cols-1 sm:grid-cols-2";
      case "3": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "4": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Decks</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDecks}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer un nouveau deck
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Affichage:</span>
          <ToggleGroup type="single" value={gridLayout} onValueChange={handleLayoutChange}>
            <ToggleGroupItem value="1" aria-label="Une colonne" title="Une colonne">
              <Rows className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Deux colonnes" title="Deux colonnes">
              <Columns className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="Trois colonnes" title="Trois colonnes">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="Quatre colonnes" title="Quatre colonnes">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="text-sm text-muted-foreground">
          {decks.length} deck{decks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore créé de decks.
          </p>
          <Button asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer votre premier deck
            </Link>
          </Button>
        </div>
      ) : (
        <div className={`grid ${getGridClasses()} gap-6`}>
          {decks.map(deck => (
            <DeckCard 
              key={deck.id}
              id={deck.id}
              title={deck.title}
              description={deck.description}
              cardCount={0} // TODO: Implement card count calculation
              coverImage={deck.coverImage}
              tags={deck.tags}
              author={user?.name || 'Utilisateur'}
              isPublic={deck.isPublic}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDecksPage;
