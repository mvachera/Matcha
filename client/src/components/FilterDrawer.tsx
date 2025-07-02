import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SAMPLE_INTERESTS } from "@/constants/interests";
import { UserProfile, TempFilters } from "./home";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";

interface FilterDrawerProps {
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  tempFilters: TempFilters;
  setTempFilters: React.Dispatch<React.SetStateAction<TempFilters>>;
  applyFilters: () => void;
  resetFilters: () => void;
  userProfile: UserProfile;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  showFilterDrawer,
  setShowFilterDrawer,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  userProfile,
}) => {
  // Toggle interest in filter avec limite de 5 intérêts
  const toggleInterestFilter = (interest: string): void => {
    setTempFilters((prev) => {
      // Si l'intérêt est déjà sélectionné, le retirer
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest)
        };
      } 
      // Sinon, vérifier si on atteint la limite de 5 intérêts
      else if (prev.interests.length < 5) {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      } 
      // Si déjà 5 intérêts sélectionnés, ne rien ajouter et afficher un toast
      else {
        toast({
          title: "Limite atteinte",
          description: "Vous ne pouvez pas sélectionner plus de 5 intérêts",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  // Fonction pour envoyer les filtres au backend
  const sendFiltersToBackend = async () => {
    // Préparer les données à envoyer
    const filtersData = {
      ageRange: tempFilters.ageRange,
      maxDistance: tempFilters.maxDistance,
      fameRating: tempFilters.fameRating,
      interests: tempFilters.interests
    };
    
    console.log("Données à envoyer au backend:", filtersData);
    
    // Exemple avec fetch:
    await api.put('users/filter', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtersData)
    })
      .catch(error => {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer vos préférences",
          variant: "destructive"
        });
      });
    
      toast({
        title: "Filtres appliqués",
        description: "Vos préférences ont été enregistrées",
      });

    // Appliquer les filtres localement
    applyFilters();
  };

  return (
    <Drawer open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 relative">
          <Filter className="h-4 w-4" />
          {userProfile.activeFilters?.interests.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
              {userProfile.activeFilters.interests.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Filtrer les correspondances</DrawerTitle>
            <DrawerDescription>Ajustez vos préférences pour trouver de meilleures correspondances</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2">
            <div className="mb-6">
              <Label className="text-base font-semibold mb-2 block">Tranche d'âge</Label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{tempFilters.ageRange.min} ans</span>
                <span className="text-sm text-gray-500">{tempFilters.ageRange.max} ans</span>
              </div>
              <div className="flex gap-4 items-center">
                <Input
                  type="number"
                  min="18"
                  max={tempFilters.ageRange.max}
                  value={tempFilters.ageRange.min}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      ageRange: {
                        ...prev.ageRange,
                        min: Math.min(parseInt(e.target.value) || 18, prev.ageRange.max),
                      },
                    }))
                  }
                  className="w-20"
                />
                <Slider
                  min={18}
                  max={100}
                  step={1}
                  value={[tempFilters.ageRange.min, tempFilters.ageRange.max]}
                  onValueChange={(values) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      ageRange: { min: values[0], max: values[1] },
                    }))
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={tempFilters.ageRange.min}
                  max="100"
                  value={tempFilters.ageRange.max}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      ageRange: {
                        ...prev.ageRange,
                        max: Math.max(parseInt(e.target.value) || 18, prev.ageRange.min),
                      },
                    }))
                  }
                  className="w-20"
                />
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-base font-semibold mb-2 block">Distance maximale</Label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">0 km</span>
                <span className="text-sm text-gray-500">{tempFilters.maxDistance} km</span>
              </div>
              <Slider
                min={1}
                max={500}
                step={1}
                value={[tempFilters.maxDistance]}
                onValueChange={(values) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    maxDistance: values[0],
                  }))
                }
              />
            </div>

            <div className="mb-6">
              <Label className="text-base font-semibold mb-2 block">Cote de popularité</Label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Membre</span>
                <span className="text-sm text-gray-500">{tempFilters.fameRating}</span>
              </div>
              <Slider
                min={0}
                max={5}
                step={1}
                value={[tempFilters.fameRating === "Membre" ? 0 :
                       tempFilters.fameRating === "Apprecier" ? 1 :
                       tempFilters.fameRating === "Reconnu" ? 2 :
                       tempFilters.fameRating === "Famous" ? 3 :
                       tempFilters.fameRating === "Star" ? 4 : 5]}
                onValueChange={(values) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    fameRating: values[0] === 0 ? "Membre" :
                               values[0] === 1 ? "Apprecier" :
                               values[0] === 2 ? "Reconnu" :
                               values[0] === 3 ? "Famous" :
                               values[0] === 4 ? "Star" : "Legende",
                  }))
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs">Membre</span>
                <span className="text-xs">Apprecier</span>
                <span className="text-xs">Reconnu</span>
                <span className="text-xs">Famous</span>
                <span className="text-xs">Star</span>
                <span className="text-xs">Legende</span>
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-base font-semibold mb-2 flex justify-between items-center">
                <span>Intérêts</span>
                <span className="text-sm text-gray-500">{tempFilters.interests.length}/5</span>
              </Label>
              <p className="text-sm text-gray-500 mb-3">Sélectionnez des intérêts pour filtrer</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {tempFilters.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1 text-sm cursor-pointer"
                    onClick={() => toggleInterestFilter(interest)}
                  >
                    {interest} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>

              <p className="text-sm font-medium mb-2">Intérêts suggérés:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_INTERESTS.filter((i) => !tempFilters.interests.includes(i))
                  .slice(0, 12)
                  .map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="px-3 py-1 text-sm cursor-pointer hover:bg-indigo-50"
                      onClick={() => toggleInterestFilter(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={sendFiltersToBackend}>Appliquer les filtres</Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Réinitialiser les filtres
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;