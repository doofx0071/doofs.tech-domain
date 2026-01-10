import { useState } from "react";
import Avatar from "boring-avatars";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  currentAvatar?: string;
  currentVariant?: string;
  userName: string;
  onSave: (avatar: string, variant: string) => void;
}

const AVATAR_VARIANTS = [
  { name: "marble", label: "Marble" },
  { name: "beam", label: "Beam" },
  { name: "pixel", label: "Pixel" },
  { name: "sunset", label: "Sunset" },
  { name: "ring", label: "Ring" },
  { name: "bauhaus", label: "Bauhaus" },
];

const COLOR_PALETTES = [
  { name: "default", colors: ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"] },
  { name: "ocean", colors: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"] },
  { name: "sunset", colors: ["#f94144", "#f3722c", "#f8961e", "#f9844a", "#f9c74f"] },
  { name: "forest", colors: ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"] },
  { name: "purple", colors: ["#7209b7", "#560bad", "#b5179e", "#f72585", "#4361ee"] },
  { name: "pastel", colors: ["#e0b0ff", "#b4e4ff", "#ffe4e1", "#f0e68c", "#d8bfd8"] },
];

export function AvatarPicker({ currentAvatar, currentVariant, userName, onSave }: AvatarPickerProps) {
  const [selectedVariant, setSelectedVariant] = useState(currentVariant || "marble");
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const paletteKey = `${selectedVariant}-${selectedPalette}`;
    onSave(paletteKey, selectedVariant);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select a style and color palette for your avatar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar
                size={120}
                name={userName}
                variant={selectedVariant as any}
                colors={COLOR_PALETTES[selectedPalette].colors}
              />
            </div>
          </div>

          {/* Variant Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Avatar Style</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_VARIANTS.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => setSelectedVariant(variant.name)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                    selectedVariant === variant.name ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Avatar
                    size={48}
                    name={userName}
                    variant={variant.name as any}
                    colors={COLOR_PALETTES[selectedPalette].colors}
                  />
                  <span className="text-xs font-medium">{variant.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Color Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PALETTES.map((palette, index) => (
                <button
                  key={palette.name}
                  onClick={() => setSelectedPalette(index)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                    selectedPalette === index ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex gap-1">
                    {palette.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium capitalize">{palette.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Avatar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
