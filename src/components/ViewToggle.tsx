
import { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export const ViewToggle = () => {
  const actuallyIsMobile = useIsMobile();
  const [forcedView, setForcedView] = useState<"auto" | "mobile" | "desktop">("auto");
  const { toast } = useToast();
  
  const toggleView = (value: string) => {
    if (!value) return;
    
    const newView = value as "auto" | "mobile" | "desktop";
    setForcedView(newView);
    
    if (newView === "auto") {
      document.documentElement.classList.remove("force-desktop", "force-mobile");
      localStorage.removeItem("viewMode");
      toast({
        title: "Mode d'affichage automatique",
        description: "L'affichage s'adapte maintenant à votre appareil"
      });
    } else if (newView === "mobile") {
      document.documentElement.classList.remove("force-desktop");
      document.documentElement.classList.add("force-mobile");
      localStorage.setItem("viewMode", "mobile");
      toast({
        title: "Mode mobile activé",
        description: "L'affichage est maintenant optimisé pour mobile"
      });
    } else if (newView === "desktop") {
      document.documentElement.classList.remove("force-mobile");
      document.documentElement.classList.add("force-desktop");
      localStorage.setItem("viewMode", "desktop");
      toast({
        title: "Mode bureau activé",
        description: "L'affichage est maintenant optimisé pour desktop"
      });
    }
  };
  
  // Load saved preference
  useEffect(() => {
    const savedView = localStorage.getItem("viewMode") as "mobile" | "desktop" | null;
    if (savedView) {
      setForcedView(savedView);
      toggleView(savedView);
    }
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1 hidden md:inline">Affichage:</span>
      <ToggleGroup type="single" value={forcedView} onValueChange={toggleView}>
        <ToggleGroupItem value="auto" aria-label="Mode automatique" title="Mode automatique">
          Auto
        </ToggleGroupItem>
        <ToggleGroupItem value="desktop" aria-label="Mode bureau" title="Mode bureau">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="mobile" aria-label="Mode mobile" title="Mode mobile">
          <Smartphone className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
