import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw, 
  Shuffle,
  BookOpen,
  Layers,
  Home,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Volume,
  ZoomIn,
  ZoomOut,
  Send,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import FlashCard from "@/components/FlashCard";

import { 
  getDeck, 
  getTheme,
  getFlashcardsByDeck,
  getFlashcardsByTheme,
  Flashcard, 
  Deck,
  Theme
} from "@/lib/localStorage";

import { evaluateAnswer } from "@/services/geminiService";

const StudyPage = () => {
  const { id, themeId } = useParams<{ id: string; themeId?: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);
  const [autoFlipDelay, setAutoFlipDelay] = useState(5);
  const [shuffleCards, setShuffleCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studyMode, setStudyMode] = useState<"all" | "learning" | "review">("all");
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [studyHistory, setStudyHistory] = useState<Array<{ id: string; known: boolean }>>([]);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [useAiEvaluation, setUseAiEvaluation] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const autoFlipTimer = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const deckData = getDeck(id);
    if (!deckData) {
      toast({
        title: "Deck introuvable",
        description: "Le deck que vous recherchez n'existe pas",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    setDeck(deckData);
    
    if (themeId) {
      const themeData = getTheme(themeId);
      if (!themeData) {
        toast({
          title: "Thème introuvable",
          description: "Le thème que vous recherchez n'existe pas",
          variant: "destructive",
        });
        navigate(`/deck/${id}`);
        return;
      }
      
      setTheme(themeData);
      const cards = getFlashcardsByTheme(themeId);
      setFlashcards(cards);
    } else {
      const cards = getFlashcardsByDeck(id);
      setFlashcards(cards);
    }
    
    setIsLoading(false);
  }, [id, themeId, navigate, toast]);
  
  useEffect(() => {
    if (shuffleCards) {
      setFlashcards(cards => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        return shuffled;
      });
    }
  }, [shuffleCards]);
  
  useEffect(() => {
    if (autoFlip && !isFlipped) {
      autoFlipTimer.current = setTimeout(() => {
        setIsFlipped(true);
      }, autoFlipDelay * 1000);
    }
    
    return () => {
      if (autoFlipTimer.current) {
        clearTimeout(autoFlipTimer.current);
      }
    };
  }, [currentIndex, isFlipped, autoFlip, autoFlipDelay]);
  
  useEffect(() => {
    if (flashcards.length > 0) {
      setProgress(Math.round((currentIndex / flashcards.length) * 100));
    }
  }, [currentIndex, flashcards.length]);
  
  useEffect(() => {
    if (autoPlayAudio && !isFlipped && flashcards[currentIndex]?.front.audio) {
      if (audioRef.current) {
        audioRef.current.src = flashcards[currentIndex].front.audio!;
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    } else if (autoPlayAudio && isFlipped && flashcards[currentIndex]?.back.audio) {
      if (audioRef.current) {
        audioRef.current.src = flashcards[currentIndex].back.audio!;
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  }, [currentIndex, isFlipped, autoPlayAudio, flashcards]);
  
  useEffect(() => {
    if (!id) return;
    
    let cards: Flashcard[];
    
    if (themeId) {
      cards = getFlashcardsByTheme(themeId);
    } else {
      cards = getFlashcardsByDeck(id);
    }
    
    if (studyMode === "learning") {
      cards = cards.filter(card => !knownCards.includes(card.id));
    } else if (studyMode === "review") {
      cards = cards.filter(card => knownCards.includes(card.id));
    }
    
    if (shuffleCards) {
      cards = [...cards].sort(() => Math.random() - 0.5);
    }
    
    setFlashcards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [id, themeId, studyMode, knownCards, shuffleCards]);
  
  const handleCardFlip = () => {
    if (autoFlipTimer.current) {
      clearTimeout(autoFlipTimer.current);
    }
    setIsFlipped(!isFlipped);
  };
  
  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      toast({
        title: "Félicitations!",
        description: "Vous avez terminé toutes les cartes de ce deck.",
      });
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };
  
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };
  
  const handleKnownCard = () => {
    const currentCard = flashcards[currentIndex];
    if (!knownCards.includes(currentCard.id)) {
      setKnownCards([...knownCards, currentCard.id]);
    }
    
    setStudyHistory([...studyHistory, { id: currentCard.id, known: true }]);
    handleNextCard();
  };
  
  const handleUnknownCard = () => {
    const currentCard = flashcards[currentIndex];
    setKnownCards(knownCards.filter(id => id !== currentCard.id));
    setStudyHistory([...studyHistory, { id: currentCard.id, known: false }]);
    handleNextCard();
  };
  
  const resetStudySession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setStudyHistory([]);
    toast({
      title: "Session réinitialisée",
      description: "Toutes les cartes ont été réinitialisées.",
    });
  };
  
  const shuffleCurrentCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast({
      title: "Cartes mélangées",
      description: "L'ordre des cartes a été modifié aléatoirement.",
    });
  };
  
  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  };
  
  const handleEvaluateAnswer = async () => {
    if (!isFlipped && userAnswer.trim()) {
      setIsEvaluating(true);
      
      try {
        if (useAiEvaluation) {
          const feedback = await evaluateAnswer(
            userAnswer,
            flashcards[currentIndex].back.text
          );
          
          setAnswerFeedback(feedback);
          
          if (feedback.score > 0.8) {
            if (!knownCards.includes(flashcards[currentIndex].id)) {
              setKnownCards([...knownCards, flashcards[currentIndex].id]);
            }
            setStudyHistory([...studyHistory, { id: flashcards[currentIndex].id, known: true }]);
          } else if (feedback.score < 0.3) {
            setKnownCards(knownCards.filter(id => id !== flashcards[currentIndex].id));
            setStudyHistory([...studyHistory, { id: flashcards[currentIndex].id, known: false }]);
          }
        }
        
        setIsFlipped(true);
      } catch (error) {
        console.error("Error evaluating answer:", error);
        toast({
          title: "Erreur d'évaluation",
          description: "Impossible d'évaluer votre réponse pour le moment.",
          variant: "destructive",
        });
      } finally {
        setIsEvaluating(false);
      }
    } else {
      handleCardFlip();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEvaluateAnswer();
    }
  };
  
  const handleNextWithReset = () => {
    setUserAnswer("");
    setAnswerFeedback(null);
    handleNextCard();
  };
  
  const handlePrevWithReset = () => {
    setUserAnswer("");
    setAnswerFeedback(null);
    handlePrevCard();
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 70));
  };
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (flashcards.length === 0) {
    return (
      <div className="container px-4 py-8">
        <Link to={themeId ? `/deck/${id}/theme/${themeId}` : `/deck/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Link>
        
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Aucune carte à étudier</h1>
          <p className="text-muted-foreground mb-6">
            {studyMode === "learning" 
              ? "Vous avez déjà appris toutes les cartes ! Essayez le mode révision." 
              : studyMode === "review" 
                ? "Aucune carte à réviser. Essayez d'abord le mode apprentissage." 
                : "Ce deck ne contient pas encore de flashcards."}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to={themeId ? `/deck/${id}/theme/${themeId}` : `/deck/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            
            {studyMode !== "all" && (
              <Button variant="outline" onClick={() => setStudyMode("all")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Voir toutes les cartes
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to={themeId ? `/deck/${id}/theme/${themeId}` : `/deck/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour au {themeId ? "thème" : "deck"}
        </Link>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 70}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{zoomLevel}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 150}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">
            {theme ? theme.title : deck?.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex justify-center mb-6" style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.3s ease' }}>
        <div className="w-full max-w-2xl">
          {flashcards[currentIndex] && (
            <FlashCard
              id={flashcards[currentIndex].id}
              front={flashcards[currentIndex].front}
              back={flashcards[currentIndex].back}
              onCardFlip={() => handleCardFlip()}
              className={isFlipped ? "flipped" : ""}
            />
          )}
        </div>
      </div>
      
      {!isFlipped && (
        <div className="mb-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="answer">Votre réponse :</Label>
            <div className="flex gap-2">
              <Textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Saisissez votre réponse..."
                className="flex-1 resize-none min-h-[100px]"
              />
              <Button 
                className="self-end"
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating}
              >
                {isEvaluating ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Vérifier
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isFlipped && answerFeedback && (
        <Card className={`mb-6 ${
          answerFeedback.score > 0.8 
            ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
            : answerFeedback.score < 0.3 
              ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
              : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              {answerFeedback.score > 0.8 ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
              ) : answerFeedback.score < 0.3 ? (
                <X className="h-5 w-5 text-red-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <Badge variant={answerFeedback.score > 0.8 ? "success" : answerFeedback.score < 0.3 ? "destructive" : "warning"} className="mb-2">
                  {answerFeedback.score > 0.8 
                    ? "Correct" 
                    : answerFeedback.score < 0.3 
                      ? "Incorrect" 
                      : "Partiellement correct"}
                </Badge>
                <p className="text-sm">{answerFeedback.feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center gap-3 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePrevWithReset}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {!isFlipped ? (
          <Button variant="outline" onClick={handleCardFlip}>
            Voir la réponse
          </Button>
        ) : (
          <Button variant="outline" onClick={handleCardFlip}>
            Voir la question
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNextWithReset}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {isFlipped && (
        <div className="flex justify-center gap-3 mb-6">
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={handleKnownCard}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Je connais
          </Button>
          
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={handleUnknownCard}>
            <ThumbsDown className="mr-2 h-4 w-4" />
            À revoir
          </Button>
        </div>
      )}
      
      <div className="flex justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={resetStudySession}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Réinitialiser
        </Button>
        
        <Button variant="ghost" size="sm" onClick={shuffleCurrentCards}>
          <Shuffle className="mr-1 h-4 w-4" />
          Mélanger
        </Button>
        
        {(flashcards[currentIndex]?.front.audio && !isFlipped) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => playAudio(flashcards[currentIndex].front.audio!)}
          >
            <Volume className="mr-1 h-4 w-4" />
            Écouter
          </Button>
        )}
        
        {(flashcards[currentIndex]?.back.audio && isFlipped) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => playAudio(flashcards[currentIndex].back.audio!)}
          >
            <Volume className="mr-1 h-4 w-4" />
            Écouter
          </Button>
        )}
      </div>
      
      <audio ref={audioRef} className="hidden" />
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres d'étude</DialogTitle>
            <DialogDescription>
              Personnalisez votre session d'apprentissage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Mode d'étude</Label>
              <RadioGroup value={studyMode} onValueChange={(value) => setStudyMode(value as "all" | "learning" | "review")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">Toutes les cartes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="learning" id="learning" />
                  <Label htmlFor="learning">Apprentissage (cartes non maîtrisées)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="review" id="review" />
                  <Label htmlFor="review">Révision (cartes maîtrisées)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shuffle">Mélanger les cartes</Label>
                <p className="text-xs text-muted-foreground">
                  Affiche les cartes dans un ordre aléatoire
                </p>
              </div>
              <Switch
                id="shuffle"
                checked={shuffleCards}
                onCheckedChange={setShuffleCards}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-flip">Retourner automatiquement</Label>
                <p className="text-xs text-muted-foreground">
                  Retourne automatiquement la carte après un délai
                </p>
              </div>
              <Switch
                id="auto-flip"
                checked={autoFlip}
                onCheckedChange={setAutoFlip}
              />
            </div>
            
            {autoFlip && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="auto-flip-delay">Délai de retournement: {autoFlipDelay} secondes</Label>
                </div>
                <Slider
                  id="auto-flip-delay"
                  min={1}
                  max={10}
                  step={1}
                  value={[autoFlipDelay]}
                  onValueChange={(value) => setAutoFlipDelay(value[0])}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-play-audio">Lecture audio automatique</Label>
                <p className="text-xs text-muted-foreground">
                  Joue automatiquement l'audio si disponible
                </p>
              </div>
              <Switch
                id="auto-play-audio"
                checked={autoPlayAudio}
                onCheckedChange={setAutoPlayAudio}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-evaluation">Évaluation par IA</Label>
                <p className="text-xs text-muted-foreground">
                  Utilise l'IA pour évaluer vos réponses
                </p>
              </div>
              <Switch
                id="ai-evaluation"
                checked={useAiEvaluation}
                onCheckedChange={setUseAiEvaluation}
              />
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </Link>
              </Button>
              
              <Button onClick={() => setShowSettings(false)}>
                Fermer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyPage;
