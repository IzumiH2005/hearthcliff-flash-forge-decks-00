
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ThemeCardProps {
  id: string;
  deckId: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string;
}

const ThemeCard = ({
  id,
  deckId,
  title,
  description,
  cardCount,
  coverImage,
}: ThemeCardProps) => {
  return (
    <Link to={`/deck/${deckId}/theme/${id}`}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {coverImage ? (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 text-white">
              <span className="text-xs font-medium">{cardCount} cartes</span>
            </div>
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-accent/30 to-primary/30 flex items-center justify-center">
            <Layers className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between p-4 pt-0">
          {!coverImage && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span>{cardCount} cartes</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <span>Explorer</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ThemeCard;
