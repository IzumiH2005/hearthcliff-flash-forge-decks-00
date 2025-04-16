
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/explore/SearchBar";
import { FilterTags } from "@/components/explore/FilterTags";
import { DeckGrid } from "@/components/explore/DeckGrid";
import { LoadingState } from "@/components/explore/LoadingState";
import { usePublicDecks } from "@/hooks/usePublicDecks";
import { DeckCardProps } from "@/components/DeckCard";

const ExplorePage = () => {
  const { decks, isLoading, allTags, fetchPublicDecks } = usePublicDecks();
  const [filteredDecks, setFilteredDecks] = useState<DeckCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterTags 
          allTags={allTags} 
          activeFilters={activeFilters} 
          toggleFilter={toggleFilter} 
          clearFilters={clearFilters} 
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
            <TabsTrigger value="popular">Populaires</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <DeckGrid decks={filteredDecks} onClearFilters={clearFilters} />
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <DeckGrid 
              decks={filteredDecks.sort((a, b) => b.id.localeCompare(a.id))}
            />
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <DeckGrid 
              decks={filteredDecks.sort((a, b) => b.cardCount - a.cardCount)}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ExplorePage;
