
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Volume } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlashCardProps {
  id: string;
  front: {
    text: string;
    image?: string;
    audio?: string;
  };
  back: {
    text: string;
    image?: string;
    audio?: string;
  };
  onCardFlip?: (id: string, isFlipped: boolean) => void;
  className?: string;
}

const FlashCard = ({
  id,
  front,
  back,
  onCardFlip,
  className
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [height, setHeight] = useState("auto");
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (frontRef.current && backRef.current) {
      setHeight(
        Math.max(
          frontRef.current.scrollHeight,
          backRef.current.scrollHeight
        ) + "px"
      );
    }
  }, [front, back]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onCardFlip) {
      onCardFlip(id, !isFlipped);
    }
  };

  const playAudio = (audioSrc: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
    }
  };

  return (
    <div 
      className={cn(
        "flashcard w-full cursor-pointer perspective-1000",
        isFlipped ? "flipped" : "",
        className
      )}
      style={{ height }}
      onClick={handleFlip}
    >
      <div className="flashcard-inner w-full h-full relative">
        <div 
          ref={frontRef}
          className="flashcard-front bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-4 border border-white/20"
        >
          {front.image && (
            <div className="w-full max-h-48 overflow-hidden rounded-lg mb-4 border border-white/20 shadow-md">
              <img
                src={front.image}
                alt="Front side"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-xl font-medium text-center">{front.text}</p>
          {front.audio && (
            <button
              onClick={(e) => playAudio(front.audio!, e)}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors backdrop-blur-sm"
            >
              <Volume className="h-5 w-5" />
            </button>
          )}
        </div>
        <div 
          ref={backRef}
          className="flashcard-back bg-gradient-to-br from-accent/20 to-secondary/20 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-4 border border-white/20"
        >
          {back.image && (
            <div className="w-full max-h-48 overflow-hidden rounded-lg mb-4 border border-white/20 shadow-md">
              <img
                src={back.image}
                alt="Back side"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-xl font-medium text-center">{back.text}</p>
          {back.audio && (
            <button
              onClick={(e) => playAudio(back.audio!, e)}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors backdrop-blur-sm"
            >
              <Volume className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default FlashCard;
