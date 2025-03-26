import React from 'react';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PreviewGrid: React.FC = () => {
  const { files, removeFile } = useFiles();

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">
          Uploaded Designs <span className="text-muted-foreground">({files.length}/5)</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          {files.length > 1 ? `${files.length} files` : '1 file'}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {files.map((file) => (
          <div 
            key={file.id}
            className={cn(
              "group relative aspect-video rounded-lg overflow-hidden",
              "border border-border bg-card shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/30"
            )}
          >
            {/* Preview Image */}
            {file.previewUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="object-cover w-full h-full"
                  onLoad={(e) => {
                    // Revoke the object URL to avoid memory leaks
                    if (e.currentTarget.src.startsWith('blob:')) {
                      URL.revokeObjectURL(e.currentTarget.src);
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                <ImageIcon className="text-muted-foreground" size={24} />
              </div>
            )}

            {/* File Info Overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-2",
              "bg-gradient-to-t from-black/60 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}>
              <p className="text-xs text-white font-medium truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-white/80">
                {file.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>

            {/* Remove Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                removeFile(file.id);
              }}
              variant="destructive"
              size="icon"
              className={cn(
                "absolute top-2 right-2 h-6 w-6 rounded-full",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-destructive/90"
              )}
              aria-label="Remove file"
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewGrid;
