
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Copy, Key, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Session key generation and management
const STORAGE_KEY = "cds-flashcard-session-key";

const generateSessionKey = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 6).toUpperCase() + 
         Math.random().toString(36).substring(2, 4).toUpperCase();
};

const saveSessionKey = (key: string): void => {
  localStorage.setItem(STORAGE_KEY, key);
};

const getSessionKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

const LoginPage = () => {
  const [sessionKey, setSessionKey] = useState<string>(getSessionKey() || "");
  const [inputKey, setInputKey] = useState<string>("");
  const [showSessionInfo, setShowSessionInfo] = useState<boolean>(!!getSessionKey());
  const navigate = useNavigate();

  useEffect(() => {
    // Generate session key if not already present
    if (!sessionKey) {
      const newKey = generateSessionKey();
      setSessionKey(newKey);
      saveSessionKey(newKey);
      setShowSessionInfo(true);
    }
  }, [sessionKey]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(sessionKey);
    toast({
      title: "Clé copiée!",
      description: "Votre clé de session a été copiée dans le presse-papier.",
    });
  };

  const handleStartAdventure = () => {
    navigate("/");
  };

  const handleLoadSession = () => {
    if (!inputKey) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une clé de session.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would validate the key against a database
    // For demo purposes, we'll just save it and proceed
    saveSessionKey(inputKey);
    setSessionKey(inputKey);
    setShowSessionInfo(true);
    
    toast({
      title: "Session chargée!",
      description: "Votre session a été chargée avec succès.",
    });
    
    navigate("/");
  };

  const generateNewKey = () => {
    const newKey = generateSessionKey();
    setSessionKey(newKey);
    saveSessionKey(newKey);
    setShowSessionInfo(true);
    
    toast({
      title: "Nouvelle clé générée!",
      description: "N'oubliez pas de la sauvegarder pour accéder à vos données ultérieurement.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 purple-gradient text-white">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="text-4xl">🎭</span>
          <h1 className="text-4xl font-bold">CDS</h1>
          <span className="text-4xl">🎭</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">FLASHCARD-BASE</h1>
        <p className="max-w-md mx-auto">
          Créez des flashcards sur les verses de votre choix et accédez aux notes de d'autres quizzeurs ⚡
        </p>
      </div>

      <div className="w-full max-w-md">
        <Tabs defaultValue={showSessionInfo ? "key" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20">
            <TabsTrigger value="login">
              <LogIn className="mr-2 h-4 w-4" />
              Connexion
            </TabsTrigger>
            <TabsTrigger value="key">
              <Key className="mr-2 h-4 w-4" />
              Clé de Session
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="bg-white/10 backdrop-blur-sm rounded-md mt-2 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-key" className="text-white">Clé de session</Label>
                <Input 
                  id="session-key" 
                  placeholder="Entrez votre clé de session" 
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="bg-white/20 text-white placeholder:text-white/70 border-white/30"
                />
              </div>
              <Button 
                onClick={handleLoadSession} 
                className="w-full bg-white/30 hover:bg-white/40 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Charger la session
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="key" className="session-key-box mt-2">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-medium">Votre clé de session:</h3>
                <p className="session-key my-3">{sessionKey}</p>
                <p className="text-sm">
                  Conservez cette clé pour accéder à vos données ultérieurement
                </p>
              </div>
              
              <Button 
                onClick={handleCopyKey} 
                className="copy-button mx-auto"
              >
                <Copy className="h-4 w-4" />
                Copier
              </Button>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={generateNewKey}
                >
                  Générer une nouvelle clé
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Button
        size="lg"
        onClick={handleStartAdventure}
        className="mt-8 bg-white text-primary hover:bg-white/90 transition-all duration-300"
      >
        Commencer l'aventure →
      </Button>
      
    </div>
  );
};

export default LoginPage;
