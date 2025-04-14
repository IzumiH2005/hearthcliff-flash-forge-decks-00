
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
          className="flashcard-front bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-4 border border-indigo-200/40 dark:border-indigo-800/40"
        >
          {front.image && (
            <div className="w-full max-h-48 overflow-hidden rounded-lg mb-4 border border-indigo-200/40 dark:border-indigo-800/40 shadow-md">
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
              className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30 transition-colors backdrop-blur-sm"
            >
              <Volume className="h-5 w-5" />
            </button>
          )}
        </div>
        <div 
          ref={backRef}
          className="flashcard-back bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-4 border border-purple-200/40 dark:border-purple-800/40"
        >
          {back.image && (
            <div className="w-full max-h-48 overflow-hidden rounded-lg mb-4 border border-purple-200/40 dark:border-purple-800/40 shadow-md">
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
              className="absolute bottom-3 right-3 p-2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 transition-colors backdrop-blur-sm"
            >
              <Volume className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
      
      <style>
        {`
        .flashcard {
          transition: transform 0.3s;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flashcard.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        
        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        .flashcard-back {
          transform: rotateY(180deg);
        }
        `}
      </style>
    </div>
  );
};

export default FlashCard;
