
import DeckCard, { DeckCardProps } from "@/components/DeckCard";
import { Button } from "@/components/ui/button";

interface DeckGridProps {
  decks: DeckCardProps[];
  onClearFilters?: () => void;
  emptyMessage?: string;
}

export const DeckGrid = ({ 
  decks, 
  onClearFilters,
  emptyMessage = "Aucun deck ne correspond à votre recherche" 
}: DeckGridProps) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          {emptyMessage}
        </p>
        {onClearFilters && (
          <Button variant="link" onClick={onClearFilters} className="mt-2">
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
