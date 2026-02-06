import { useState, useCallback } from 'react';
import { Upload, X, Camera, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PhotoType = 'dial' | 'caseback' | 'side' | 'clasp' | 'box' | 'papers';

interface PhotoSlot {
  type: PhotoType;
  label: string;
  description: string;
  required: boolean;
}

export const PHOTO_SLOTS: PhotoSlot[] = [
  { type: 'dial', label: 'Dial Front', description: 'Clear front-facing dial shot', required: true },
  { type: 'caseback', label: 'Caseback', description: 'Serial number visible', required: true },
  { type: 'side', label: 'Side Profile', description: 'Case thickness and crown', required: true },
  { type: 'clasp', label: 'Clasp/Bracelet', description: 'Clasp or strap detail', required: true },
  { type: 'box', label: 'Box', description: 'Original box if included', required: false },
  { type: 'papers', label: 'Papers/Warranty', description: 'Documentation if included', required: false },
];

interface PhotoUploadProps {
  photos: Record<PhotoType, File | null>;
  onPhotoChange: (type: PhotoType, file: File | null) => void;
  hasBox: boolean;
  hasPapers: boolean;
}

export function PhotoUpload({ photos, onPhotoChange, hasBox, hasPapers }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState<PhotoType | null>(null);

  const handleDrop = useCallback((type: PhotoType, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoChange(type, file);
    }
  }, [onPhotoChange]);

  const handleFileSelect = (type: PhotoType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(type, file);
    }
  };

  const getPreviewUrl = (file: File | null) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  // Filter slots based on box/papers toggles
  const visibleSlots = PHOTO_SLOTS.filter(slot => {
    if (slot.type === 'box') return hasBox;
    if (slot.type === 'papers') return hasPapers;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium">Watch Photos</h3>
        <p className="text-sm text-muted-foreground">
          {visibleSlots.filter(s => s.required).length} required photos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visibleSlots.map((slot) => {
          const file = photos[slot.type];
          const previewUrl = getPreviewUrl(file);
          const isRequired = slot.required || (slot.type === 'box' && hasBox) || (slot.type === 'papers' && hasPapers);

          return (
            <div
              key={slot.type}
              className={cn(
                "relative aspect-square border-2 border-dashed transition-colors",
                dragOver === slot.type && "border-primary bg-primary/5",
                file && "border-solid border-primary/50",
                !file && !dragOver && "border-border hover:border-primary/30"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(slot.type);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(slot.type, e)}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={slot.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onPhotoChange(slot.type, null)}
                      className="p-2 bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 p-1 bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(slot.type, e)}
                  />
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{slot.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{slot.description}</p>
                  {isRequired && (
                    <span className="text-xs text-primary mt-2">Required</span>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Accepted formats: JPG, PNG, WebP. Maximum 10MB per photo.
      </p>
    </div>
  );
}
