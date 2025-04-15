
import { useState, useEffect } from 'react';
import { getDecks, type Deck } from '@/lib/localStorage';
import { getUser } from '@/lib/localStorage';
import DeckCard from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Plus, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyDecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [user, setUser] = useState(getUser());
  const location = useLocation();
  const { toast } = useToast();

  // Fonction pour rafraîchir la liste des decks
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
