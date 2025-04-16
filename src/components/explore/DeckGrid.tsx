
import DeckCard, { DeckCardProps } from "@/components/DeckCard";

interface DeckGridProps {
  decks: DeckCardProps[];
  onClearFilters?: () => void;
}

export const DeckGrid = ({ decks, onClearFilters }: DeckGridProps) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Aucun deck ne correspond à votre recherche
        </p>
        {onClearFilters && (
          <Button variant="link" onClick={onClearFilters}>
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <DeckCard key={deck.id} {...deck} />
      ))}
    </div>
  );
};

// Don't forget to import Button
import { Button } from "@/components/ui/button";
