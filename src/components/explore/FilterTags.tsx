
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterTagsProps {
  allTags: string[];
  activeFilters: string[];
  toggleFilter: (tag: string) => void;
  clearFilters: () => void;
}

export const FilterTags = ({ 
  allTags, 
  activeFilters, 
  toggleFilter, 
  clearFilters 
}: FilterTagsProps) => {
  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {activeFilters.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Effacer les filtres
          </Button>
        )}
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
    </>
  );
};
