
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Rechercher des decks..." 
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const { toast } = useToast();

  // Synchroniser la valeur d'entrée avec la valeur externe
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Gérer la soumission de la recherche
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    
    if (inputValue.trim()) {
      console.log("Recherche effectuée:", inputValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => {
            setInputValue("");
            setSearchTerm("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};
