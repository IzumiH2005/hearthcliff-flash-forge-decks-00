
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Key, Copy, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionKey } from '@/lib/sessionManager';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user has a session key
    if (!getSessionKey()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleCopyKey = () => {
    const sessionKey = getSessionKey();
    if (sessionKey) {
      navigator.clipboard.writeText(sessionKey);
      toast({
        title: "Clé copiée!",
        description: "Votre clé de session a été copiée dans le presse-papier.",
      });
    }
  };

  return (
    <div className="min-h-screen purple-gradient text-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">🎭</span>
          <h1 className="text-5xl font-bold">
            CDS<br />FLASHCARD-<br />BASE
          </h1>
          <span className="text-5xl">🎭</span>
        </div>
        
        <p className="text-xl mb-12 max-w-lg">
          Créez des flashcards sur les verses de votre choix et accédez aux notes de d'autres quizzeurs ⚡
        </p>
        
        <Button 
          size="lg" 
          asChild
          className="bg-white text-primary hover:bg-white/90 transition-all duration-300 mb-8"
        >
          <Link to="/explore">
            Commencer l'aventure <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Link 
            to="/login" 
            className="text-white hover:underline flex items-center"
          >
            <Key className="mr-2 h-4 w-4" />
            Avez-vous une clé de session?
          </Link>
          <span className="hidden sm:inline">ou</span>
          <Link 
            to="/login?tab=key" 
            className="text-white hover:underline flex items-center"
          >
            générer une nouvelle clé
          </Link>
        </div>
        
        {getSessionKey() && (
          <div className="session-key-box max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Votre clé de session:</h3>
            <p className="session-key mb-2">{getSessionKey()}</p>
            <p className="text-sm mb-4">
              Conservez cette clé pour accéder à vos données ultérieurement
            </p>
            <Button 
              onClick={handleCopyKey} 
              variant="outline"
              className="copy-button mx-auto"
            >
              <Copy className="h-4 w-4" />
              Copier
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="p-3 w-12 h-12 mb-4 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Créez</h3>
            <p className="text-white/80">
              Créez facilement vos propres flashcards avec texte, images et audio
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="p-3 w-12 h-12 mb-4 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Apprenez</h3>
            <p className="text-white/80">
              Étudiez efficacement avec des modes d'apprentissage adaptés à votre style
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="p-3 w-12 h-12 mb-4 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Key className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Partagez</h3>
            <p className="text-white/80">
              Partagez vos decks avec d'autres utilisateurs grâce à un simple code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
