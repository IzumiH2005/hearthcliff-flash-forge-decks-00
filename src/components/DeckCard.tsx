
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen, Share2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ShareDeckDialog from "./ShareDeckDialog";

export interface DeckCardProps {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string;
  tags: string[];
  author: string;
  isPublic?: boolean;
  isShared?: boolean;
}

const DeckCard = ({
  id,
  title,
  description,
  cardCount,
  coverImage,
  tags,
  author,
  isPublic = true,
  isShared = false,
}: DeckCardProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <>
      <Link to={`/deck/${id}`}>
        <Card className="deck-card h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {coverImage ? (
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="deck-card-overlay" />
              <div className="absolute bottom-2 left-2 flex gap-2">
                {isPublic ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300">
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-500/20 text-slate-700 dark:bg-slate-500/30 dark:text-slate-300">
                    Privé
                  </Badge>
                )}
                {isShared && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300">
                    Partagé
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="h-40 w-full bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/50" />
            </div>
          )}
          <CardHeader className="p-4">
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <CardDescription className="flex items-center text-xs">
              Par {author}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            <div className="mt-4 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{cardCount} cartes</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Implement study action
                  console.log(`Study ${id}`);
                }}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
              >
                <Eye className="h-3 w-3" />
                <span>Étudier</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsShareDialogOpen(true);
                }}
                className="flex items-center gap-1 text-xs text-green-500 hover:text-green-700"
              >
                <Share2 className="h-3 w-3" />
                <span>Partager</span>
              </button>
            </div>
          </CardFooter>
        </Card>
      </Link>
      
      <ShareDeckDialog
        deckId={id}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </>
  );
};

export default DeckCard;
