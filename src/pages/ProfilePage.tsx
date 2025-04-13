
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Edit, 
  Mail, 
  Save, 
  X, 
  Upload, 
  Trash2, 
  Clock, 
  BookOpen,
  PenLine,
  Lock,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { getUser, updateUser, getDecks, Deck, deleteDeck, getBase64, updateDeck } from "@/lib/localStorage";
import DeckCard, { DeckCardProps } from "@/components/DeckCard";

const ProfilePage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(getUser());
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [decks, setDecks] = useState<DeckCardProps[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState<Partial<Deck> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load user decks
  useEffect(() => {
    if (user) {
      const userDecks = getDecks().filter(deck => deck.authorId === user.id);
      const deckData = userDecks.map(deck => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        coverImage: deck.coverImage,
        cardCount: 0, // Will be filled later
        tags: deck.tags,
        author: user.name,
        isPublic: deck.isPublic,
      }));
      setDecks(deckData);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'avatar ne doit pas dépasser 2 Mo",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      const base64 = await getBase64(file);
      setAvatar(base64);
    } catch (error) {
      console.error("Error processing avatar:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const handleProfileSave = () => {
    if (!name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = updateUser({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatar,
      });

      if (updatedUser) {
        setUser(updatedUser);
        setEditMode(false);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeck = () => {
    if (!selectedDeck) return;
    
    try {
      const success = deleteDeck(selectedDeck.id);
      if (success) {
        setDecks(decks.filter(deck => deck.id !== selectedDeck.id));
        setDeleteDialogOpen(false);
        setSelectedDeck(null);
        toast({
          title: "Deck supprimé",
          description: "Le deck a été supprimé avec succès",
        });
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le deck",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDeck = () => {
    if (!editingDeck || !editingDeck.id) return;
    
    try {
      const updatedDeck = updateDeck(editingDeck.id, {
        title: editingDeck.title,
        description: editingDeck.description,
        isPublic: editingDeck.isPublic,
      });
      
      if (updatedDeck) {
        // Update decks list
        setDecks(decks.map(deck => 
          deck.id === updatedDeck.id 
            ? {
                ...deck,
                title: updatedDeck.title,
                description: updatedDeck.description,
                isPublic: updatedDeck.isPublic,
              } 
            : deck
        ));
        
        setEditingDeck(null);
        toast({
          title: "Deck mis à jour",
          description: "Les informations du deck ont été mises à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating deck:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le deck",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setName(user?.name || "");
    setEmail(user?.email || "");
    setBio(user?.bio || "");
    setAvatar(user?.avatar);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="container px-4 py-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="decks">Mes Decks</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="relative pb-0">
              {!editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <div className="flex flex-col items-center">
                {editMode ? (
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xl">
                        {getInitials(name || user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                    />
                  </div>
                ) : (
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {editMode ? (
                  <div className="w-full space-y-4">
                    <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-center">{user.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </CardDescription>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Bio
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {user.bio || "Aucune bio ajoutée."}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Membre depuis
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>

            {editMode && (
              <CardFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cancelEdit}>
                  Annuler
                </Button>
                <Button onClick={handleProfileSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="decks">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Mes Decks</h2>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Gérez vos decks de flashcards personnels
              </p>
              <Button asChild>
                <Link to="/create">
                  <PenLine className="mr-2 h-4 w-4" />
                  Créer un nouveau deck
                </Link>
              </Button>
            </div>
          </div>

          {decks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div key={deck.id} className="relative group">
                  <DeckCard {...deck} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white"
                      onClick={() => {
                        const originalDeck = getDecks().find(d => d.id === deck.id);
                        if (originalDeck) {
                          setEditingDeck({
                            id: originalDeck.id,
                            title: originalDeck.title,
                            description: originalDeck.description,
                            isPublic: originalDeck.isPublic,
                          });
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const deck = getDecks().find(d => d.id === deck.id);
                        if (deck) {
                          setSelectedDeck(deck);
                          setDeleteDialogOpen(true);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                <h3 className="text-xl font-medium">Aucun deck trouvé</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore créé de deck de flashcards
                </p>
                <Button asChild className="mt-2">
                  <Link to="/create">
                    <PenLine className="mr-2 h-4 w-4" />
                    Créer mon premier deck
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for deleting a deck */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le deck</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le deck "{selectedDeck?.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeck}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing a deck */}
      <Dialog
        open={editingDeck !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDeck(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le deck</DialogTitle>
          </DialogHeader>
          {editingDeck && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editingDeck.title || ""}
                  onChange={(e) => setEditingDeck({...editingDeck, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={editingDeck.description || ""}
                  onChange={(e) => setEditingDeck({...editingDeck, description: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublic"
                  checked={editingDeck.isPublic}
                  onCheckedChange={(checked) => setEditingDeck({...editingDeck, isPublic: checked})}
                />
                <Label htmlFor="edit-isPublic" className="cursor-pointer flex items-center gap-2">
                  {editingDeck.isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>Deck public</span>
                      <span className="text-xs text-muted-foreground">(Visible par tous)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-yellow-500" />
                      <span>Deck privé</span>
                      <span className="text-xs text-muted-foreground">(Visible uniquement par vous)</span>
                    </>
                  )}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDeck(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateDeck}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
