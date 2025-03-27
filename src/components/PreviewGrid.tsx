import React, { useEffect } from 'react';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { X, ImageIcon } from 'lucide-react';

const PreviewGrid: React.FC = () => {
  const { files, removeFile } = useFiles();

  // Add logging to debug files state
  useEffect(() => {
    console.log('PreviewGrid files:', files);
    files.forEach(file => {
      console.log('File preview URL:', file.preview);
    });
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 animate-scale-in">
      <h3 className="text-lg font-medium mb-3">Uploaded Screens ({files.length}/5)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="group relative aspect-[4/3] rounded-lg overflow-hidden card-border card-hover bg-secondary/30"
          >
            {file.preview ? (
              <div className="absolute inset-0 flex items-center justify-center animate-blur-in">
                <img 
                  src={file.preview} 
                  alt={file.file.name}
                  className="object-cover w-full h-full"
                  onError={(e) => console.error('Image load error for file:', file, 'Error:', e)}
                  onLoad={() => console.log('Image loaded successfully for file:', file)}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white truncate px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              {file.file.name}
            </div>
            
            <Button
              onClick={() => removeFile(file.id)}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove file"
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewGrid;
