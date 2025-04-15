
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Save } from "lucide-react";
import { updateFlashcard, deleteFlashcard, Flashcard, getBase64 } from "@/lib/localStorage";
import FlashCard from "./FlashCard";

interface FlashCardItemProps {
  card: Flashcard;
  onDelete?: () => void;
  onUpdate?: (card: Flashcard) => void;
}

const FlashCardItem = ({ card, onDelete, onUpdate }: FlashCardItemProps) => {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCard, setEditingCard] = useState({
    front: { ...card.front },
    back: { ...card.back },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5 Mo",
          variant: "destructive",
        });
        return;
      }

      const base64 = await getBase64(file);
      if (side === 'front') {
        setEditingCard({
          ...editingCard,
          front: { ...editingCard.front, image: base64 },
        });
      } else {
        setEditingCard({
          ...editingCard,
          back: { ...editingCard.back, image: base64 },
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le fichier audio ne doit pas dépasser 10 Mo",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner un fichier audio",
          variant: "destructive",
        });
        return;
      }

      const base64 = await getBase64(file);
      if (side === 'front') {
        setEditingCard({
          ...editingCard,
          front: { ...editingCard.front, audio: base64 },
        });
      } else {
        setEditingCard({
          ...editingCard,
          back: { ...editingCard.back, audio: base64 },
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le fichier audio",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    if (!editingCard.front.text.trim() && !editingCard.front.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au recto de la carte",
        variant: "destructive",
      });
      return;
    }

    if (!editingCard.back.text.trim() && !editingCard.back.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au verso de la carte",
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = updateFlashcard(card.id, {
        front: editingCard.front,
        back: editingCard.back,
      });

      if (updated) {
        setShowEditDialog(false);
        onUpdate?.(updated);
        toast({
          title: "Carte mise à jour",
          description: "La flashcard a été modifiée avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la flashcard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    try {
      const success = deleteFlashcard(card.id);
      if (success) {
        setShowDeleteDialog(false);
        onDelete?.();
        toast({
          title: "Carte supprimée",
          description: "La flashcard a été supprimée avec succès",
        });
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la flashcard",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="group relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/80 hover:bg-white"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <FlashCard {...card} />
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier la flashcard</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4 border p-4 rounded-lg">
              <h3 className="font-medium">Recto de la carte</h3>
              <div className="space-y-2">
                <Label htmlFor="front-text">Texte</Label>
                <Textarea
                  id="front-text"
                  rows={3}
                  value={editingCard.front.text}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      front: { ...editingCard.front, text: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="front-image">Image (optionnelle)</Label>
                <Input
                  id="front-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'front')}
                />
                {editingCard.front.image && (
                  <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border">
                    <img
                      src={editingCard.front.image}
                      alt="Front side"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="front-audio">Audio (optionnel)</Label>
                <Input
                  id="front-audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudioUpload(e, 'front')}
                />
                {editingCard.front.audio && (
                  <audio className="w-full mt-2" controls>
                    <source src={editingCard.front.audio} />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-lg">
              <h3 className="font-medium">Verso de la carte</h3>
              <div className="space-y-2">
                <Label htmlFor="back-text">Texte</Label>
                <Textarea
                  id="back-text"
                  rows={3}
                  value={editingCard.back.text}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      back: { ...editingCard.back, text: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back-image">Image (optionnelle)</Label>
                <Input
                  id="back-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'back')}
                />
                {editingCard.back.image && (
                  <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border">
                    <img
                      src={editingCard.back.image}
                      alt="Back side"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="back-audio">Audio (optionnel)</Label>
                <Input
                  id="back-audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudioUpload(e, 'back')}
                />
                {editingCard.back.audio && (
                  <audio className="w-full mt-2" controls>
                    <source src={editingCard.back.audio} />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la carte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette flashcard ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlashCardItem;
