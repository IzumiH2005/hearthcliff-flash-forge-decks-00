
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, Share2, Check, Copy, QrCode, Link2, Send, Download, Upload, FileUp, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDecks, createShareCode, Deck, prepareDeckForSharing, importSharedDeck, updateSharedDeck, SharedDeckData } from "@/lib/localStorage";
import { exportSessionData, getSessionKey } from "@/lib/sessionManager";

const SharePage = () => {
  const { toast } = useToast();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState<string>("7");
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);
  const [sharedDeckData, setSharedDeckData] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedDeckData, setImportedDeckData] = useState<SharedDeckData | null>(null);
  const [isImportMode, setIsImportMode] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  
  const decks = getDecks();

  const generateShareCode = () => {
    if (!selectedDeck) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un deck à partager",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const days = parseInt(expiryDays, 10);
      const code = createShareCode(selectedDeck, days);
      const url = `${window.location.origin}/import/${code}`;
      
      setShareCode(code);
      setShareUrl(url);
      
      toast({
        title: "Code généré avec succès",
        description: "Le code de partage a été créé et peut maintenant être partagé",
      });
    } catch (error) {
      console.error("Error generating share code:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le code de partage",
        variant: "destructive",
      });
    }
  };
  
  const generateDeckShareFile = () => {
    if (!selectedDeck) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un deck à partager",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const sharedData = prepareDeckForSharing(selectedDeck);
      
      if (!sharedData) {
        throw new Error("Impossible de préparer les données du deck");
      }
      
      const jsonData = JSON.stringify(sharedData, null, 2);
      setSharedDeckData(jsonData);
      
      toast({
        title: "Deck préparé pour le partage",
        description: "Le fichier de partage a été généré avec succès",
      });
    } catch (error) {
      console.error("Error preparing deck for sharing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de préparer le deck pour le partage",
        variant: "destructive",
      });
    }
  };
  
  const generateExportData = () => {
    const sessionKey = getSessionKey();
    if (!sessionKey) {
      toast({
        title: "Session non trouvée",
        description: "Vous devez être connecté pour exporter vos données",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = exportSessionData();
      if (!data) {
        throw new Error("Aucune donnée à exporter");
      }
      
      setExportData(data);
      
      toast({
        title: "Données exportées",
        description: "Vos données ont été exportées avec succès",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter vos données",
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      function() {
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
        
        toast({
          title: "Copié !",
          description: `${type === 'url' ? 'Le lien' : 'Le code'} a été copié dans le presse-papier`,
        });
      },
      function(err) {
        console.error('Erreur lors de la copie:', err);
        toast({
          title: "Erreur",
          description: "Impossible de copier dans le presse-papier",
          variant: "destructive",
        });
      }
    );
  };
  
  const downloadExportData = () => {
    if (!exportData) return;
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement démarré",
      description: "Le fichier d'export a été téléchargé",
    });
  };
  
  const downloadSharedDeck = () => {
    if (!sharedDeckData) return;
    
    const selectedDeckObj = decks.find(d => d.id === selectedDeck);
    if (!selectedDeckObj) return;
    
    const blob = new Blob([sharedDeckData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deck-${selectedDeckObj.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement démarré",
      description: "Le fichier de partage du deck a été téléchargé",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // Validate the shared deck data structure
        if (!jsonData.id || !jsonData.title || !jsonData.themes || !jsonData.flashcards) {
          throw new Error("Format de fichier invalide");
        }
        
        setImportedDeckData(jsonData);
      } catch (error) {
        console.error("Error parsing shared deck file:", error);
        toast({
          title: "Format invalide",
          description: "Le fichier n'est pas un deck partageable valide",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  const importDeck = () => {
    if (!importedDeckData) {
      toast({
        title: "Aucune donnée",
        description: "Veuillez d'abord importer un fichier",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if this is an update or a new import
      if (isUpdateMode) {
        const updatedDeck = updateSharedDeck(importedDeckData);
        
        if (!updatedDeck) {
          throw new Error("Impossible de mettre à jour le deck");
        }
        
        toast({
          title: "Deck mis à jour",
          description: `${updatedDeck.title} a été mis à jour avec succès`,
        });
      } else {
        const newDeck = importSharedDeck(importedDeckData);
        
        if (!newDeck) {
          throw new Error("Impossible d'importer le deck");
        }
        
        toast({
          title: "Deck importé",
          description: `${newDeck.title} a été importé avec succès`,
        });
      }
      
      // Reset form
      setImportFile(null);
      setImportedDeckData(null);
      setIsImportMode(false);
      setIsUpdateMode(false);
    } catch (error) {
      console.error("Error importing deck:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer ou de mettre à jour le deck",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Partager vos decks
        </h1>
        <p className="text-muted-foreground mt-2">
          Générez des codes de partage pour vos decks ou exportez toutes vos données
        </p>
      </header>

      <Tabs defaultValue="share-deck" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="share-deck" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Partager un deck
          </TabsTrigger>
          <TabsTrigger value="export-data" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Exporter les données
          </TabsTrigger>
          <TabsTrigger value="import-deck" className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Importer un deck
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share-deck" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle>Partager un deck de flashcards</CardTitle>
              <CardDescription>
                Créez un fichier de partage ou un code que vous pourrez envoyer à d'autres utilisateurs
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deck-select">Sélectionnez un deck</Label>
                <Select value={selectedDeck || ""} onValueChange={setSelectedDeck}>
                  <SelectTrigger id="deck-select" className="border-indigo-200 dark:border-indigo-800/30">
                    <SelectValue placeholder="Choisir un deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.length > 0 ? (
                      decks.map((deck: Deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Aucun deck disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Button 
                    onClick={generateDeckShareFile} 
                    disabled={!selectedDeck}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Générer un fichier de partage
                  </Button>
                </div>
                <div className="flex-1">
                  <Button 
                    onClick={generateShareCode} 
                    disabled={!selectedDeck}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Générer un code de partage
                  </Button>
                </div>
              </div>
              
              {selectedDeck && (
                <div className="space-y-2">
                  <Label htmlFor="expiry">Durée de validité du code</Label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger id="expiry" className="border-indigo-200 dark:border-indigo-800/30">
                      <SelectValue placeholder="Choisir une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 jour</SelectItem>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            
            {sharedDeckData && (
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Fichier de partage</Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {new Date().toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="relative">
                      <div className="max-h-32 overflow-y-auto bg-white dark:bg-black p-3 rounded border border-indigo-200 dark:border-indigo-800/30 text-xs font-mono whitespace-pre-wrap">
                        {sharedDeckData.length > 500 
                          ? `${sharedDeckData.substring(0, 500)}...` 
                          : sharedDeckData}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={downloadSharedDeck}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le fichier de partage
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
            
            {shareCode && shareUrl && (
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Code de partage</Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {expiryDays} jours
                      </Badge>
                    </div>
                    <div className="relative">
                      <Input 
                        value={shareCode} 
                        readOnly 
                        className="pr-12 font-mono bg-white dark:bg-black border-indigo-200 dark:border-indigo-800/30"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-indigo-500"
                        onClick={() => copyToClipboard(shareCode, 'code')}
                      >
                        {copySuccess === 'code' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lien d'invitation</Label>
                    <div className="relative">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="pr-12 font-mono bg-white dark:bg-black border-indigo-200 dark:border-indigo-800/30"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-indigo-500"
                        onClick={() => copyToClipboard(shareUrl, 'url')}
                      >
                        {copySuccess === 'url' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="w-full flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/30">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/30">
                    <Link2 className="h-4 w-4" />
                    Copier le lien
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/30">
                    <Send className="h-4 w-4" />
                    Envoyer par email
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="export-data" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle>Exporter toutes vos données</CardTitle>
              <CardDescription>
                Créez une sauvegarde de vos decks, thèmes et flashcards pour les transférer ou les sécuriser
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  Informations sur l'exportation
                </h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>Les données exportées incluent tous vos decks, thèmes et flashcards</li>
                  <li>Le fichier d'export contiendra également votre clé de session</li>
                  <li>Conservez ce fichier en lieu sûr pour protéger vos données</li>
                </ul>
              </div>
              
              <Button 
                onClick={generateExportData} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Générer l'export
              </Button>
            </CardContent>
            
            {exportData && (
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Données exportées</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="max-h-32 overflow-y-auto bg-white dark:bg-black p-3 rounded border border-indigo-200 dark:border-indigo-800/30 text-xs font-mono whitespace-pre-wrap">
                      {exportData.length > 500 
                        ? `${exportData.substring(0, 500)}...` 
                        : exportData}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={downloadExportData}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le fichier JSON
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Vous pourrez importer cette sauvegarde plus tard en utilisant la fonction d'import</p>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="import-deck" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle>Importer un deck partagé</CardTitle>
              <CardDescription>
                Importez un deck partagé par un autre utilisateur via un fichier JSON
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Options d'importation
                </h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="import-new" 
                      name="import-mode"
                      checked={!isUpdateMode}
                      onChange={() => {
                        setIsUpdateMode(false);
                        setIsImportMode(true);
                      }}
                      className="text-indigo-600"
                    />
                    <Label htmlFor="import-new">Importer comme nouveau deck</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="import-update" 
                      name="import-mode"
                      checked={isUpdateMode}
                      onChange={() => {
                        setIsUpdateMode(true);
                        setIsImportMode(true);
                      }}
                      className="text-indigo-600"
                    />
                    <Label htmlFor="import-update">Mettre à jour un deck existant</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Fichier de deck partagé</Label>
                <div className="flex flex-col space-y-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="border-indigo-200 dark:border-indigo-800/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepte uniquement les fichiers JSON provenant de la fonction de partage de deck
                  </p>
                </div>
              </div>
              
              {importedDeckData && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30 space-y-2">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Informations du deck
                  </h3>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <p><strong>Titre:</strong> {importedDeckData.title}</p>
                    <p><strong>Description:</strong> {importedDeckData.description}</p>
                    <p><strong>Thèmes:</strong> {importedDeckData.themes.length}</p>
                    <p><strong>Flashcards:</strong> {importedDeckData.flashcards.length}</p>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <Button 
                      onClick={importDeck}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUpdateMode ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Mettre à jour le deck
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Importer le deck
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Vous avez reçu un code de partage ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Importez un deck partagé en utilisant le code reçu
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link to="/import">
                <Upload className="mr-2 h-4 w-4" />
                Utiliser un code de partage
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharePage;
