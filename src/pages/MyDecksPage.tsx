
import { useState, useEffect } from 'react';
import { getDecks } from '@/lib/localStorage';
import { getUser } from '@/lib/localStorage';
import DeckCard from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const MyDecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const user = getUser();

  useEffect(() => {
    // Filtrer uniquement les decks de l'utilisateur connecté
    const userDecks = getDecks().filter(deck => deck.authorId === user?.id);
    setDecks(userDecks);
  }, [user?.id]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Decks</h1>
        <Button asChild>
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer un nouveau deck
          </Link>
        </Button>
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
