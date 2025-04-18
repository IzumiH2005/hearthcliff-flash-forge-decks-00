
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Download, FileUp, Link2, RefreshCcw, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { exportDeckToJson, updateDeckFromJson, importDeckFromJson, getUser, SharedDeckExport, getDecks } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

interface ShareDeckDialogProps {
  deckId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDeckDialog: React.FC<ShareDeckDialogProps> = ({ deckId, isOpen, onClose }) => {
  const [tab, setTab] = useState<string>("export");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [linkValue, setLinkValue] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isImportingLink, setIsImportingLink] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedDeck, setSelectedDeck] = useState<string | undefined>(deckId);
  const [decks, setDecks] = useState<{id: string, title: string}[]>([]);
  
  useEffect(() => {
    // Charger tous les decks de l'utilisateur pour l'exportation
    const userDecks = getDecks()
      .filter(deck => !deck.isPublished) // Optionnel - Filtrer uniquement les decks non publiés
      .map(deck => ({
        id: deck.id,
        title: deck.title
      }));
    setDecks(userDecks);
    
    if (deckId) {
      setSelectedDeck(deckId);
    } else if (userDecks.length > 0) {
      setSelectedDeck(userDecks[0].id);
    }
  }, [deckId]);
  
  const handleExport = async () => {
    if (!selectedDeck) {
      toast({
        title: "Erreur",
        description: "Aucun deck sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsExporting(true);
      const exportedDeck = exportDeckToJson(selectedDeck);
      const jsonString = JSON.stringify(exportedDeck, null, 2);
      setJsonContent(jsonString);
      
      // Créer un lien de téléchargement
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportedDeck.title.replace(/\s+/g, '_')}_deck.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Deck exporté avec succès",
        description: "Le fichier JSON a été téléchargé",
      });
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Impossible d'exporter le deck",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonContent(content);
      } catch (error) {
        setImportError("Format de fichier invalide");
      }
    };
    reader.readAsText(file);
  };
  
  const validateDeckJson = (jsonString: string): SharedDeckExport | null => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validation minimale
      if (!data.id || !data.originalId || !data.title || !Array.isArray(data.themes) || !Array.isArray(data.flashcards)) {
        setImportError("Format de deck invalide");
        return null;
      }
      
      return data as SharedDeckExport;
    } catch (error) {
      setImportError("Erreur lors de l'analyse du JSON");
      return null;
    }
  };
  
  const handleImport = async () => {
    const user = getUser();
    if (!user) {
      setImportError("Utilisateur non connecté");
      return;
    }
    
    const deckData = validateDeckJson(jsonContent);
    if (!deckData) return;
    
    try {
      setIsImporting(true);
      const newDeckId = importDeckFromJson(deckData, user.id);
      
      toast({
        title: "Deck importé avec succès",
        description: "Le deck a été ajouté à votre collection",
      });
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      setImportError("Impossible d'importer le deck");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleUpdate = async () => {
    const deckData = validateDeckJson(jsonContent);
    if (!deckData) return;
    
    try {
      setIsUpdating(true);
      const success = updateDeckFromJson(deckData);
      
      if (success) {
        toast({
          title: "Deck mis à jour avec succès",
          description: "Les modifications ont été appliquées",
        });
        onClose();
      } else {
        setImportError("Ce deck n'a pas été importé précédemment et ne peut pas être mis à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setImportError("Impossible de mettre à jour le deck");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImportFromLink = async () => {
    if (!linkValue) {
      setImportError("Veuillez entrer un lien de partage");
      return;
    }

    setIsImportingLink(true);
    setImportError(null);

    try {
      // Ici, nous simulons l'importation par lien en chargeant le JSON à partir de l'URL
      const response = await fetch(linkValue);
      if (!response.ok) {
        throw new Error("Lien invalide ou expiré");
      }
      
      const content = await response.text();
      setJsonContent(content);
      
      toast({
        title: "Lien chargé avec succès",
        description: "Vous pouvez maintenant importer le deck",
      });
    } catch (error) {
      console.error("Erreur lors du chargement du lien:", error);
      setImportError("Impossible de charger le deck à partir de ce lien");
    } finally {
      setIsImportingLink(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Partager un Deck</DialogTitle>
          <DialogDescription>
            Exportez votre deck pour le partager ou importez un deck partagé par quelqu'un d'autre.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="export" value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="export">Exporter</TabsTrigger>
            <TabsTrigger value="import">Importer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exportez votre deck au format JSON pour le partager avec d'autres utilisateurs.
              </p>
              
              {decks.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="deck-select">Sélectionnez un deck</Label>
                    <select 
                      id="deck-select"
                      value={selectedDeck}
                      onChange={(e) => setSelectedDeck(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>{deck.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleExport} 
                    className="w-full"
                    disabled={!selectedDeck || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Exportation...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter le deck
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Vous n'avez pas encore créé de deck.</AlertDescription>
                </Alert>
              )}
              
              {jsonContent && (
                <div className="mt-4">
                  <Label htmlFor="export-json">JSON du deck</Label>
                  <Textarea 
                    id="export-json" 
                    value={jsonContent} 
                    readOnly 
                    rows={10} 
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="import">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Importez un deck partagé au format JSON pour l'ajouter à votre collection.
              </p>

              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="file">Fichier JSON</TabsTrigger>
                  <TabsTrigger value="link">Lien de partage</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="deck-file">Fichier de deck</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="deck-file" 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="link">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="deck-link">Lien de partage</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="deck-link" 
                        type="url" 
                        placeholder="https://exemple.com/deck.json" 
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                      />
                      <Button 
                        variant="outline"
                        onClick={handleImportFromLink}
                        disabled={isImportingLink}
                      >
                        {isImportingLink ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {jsonContent && (
                <div className="mt-4">
                  <Label htmlFor="import-json">Contenu JSON</Label>
                  <Textarea 
                    id="import-json" 
                    value={jsonContent}
                    onChange={e => {
                      setJsonContent(e.target.value);
                      setImportError(null);
                    }}
                    rows={8} 
                    className="font-mono text-xs"
                  />
                </div>
              )}
              
              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  className="flex-1"
                  disabled={!jsonContent || isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Importation...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Importer comme nouveau
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleUpdate} 
                  variant="outline"
                  disabled={!jsonContent || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Mettre à jour existant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDeckDialog;
