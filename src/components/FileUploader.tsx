
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Upload, FileSymlink } from 'lucide-react';

const FileUploader: React.FC = () => {
  const { addFiles } = useFiles();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);
  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    maxSize: 10485760, // 10MB
    noClick: true, // Disable click to open file dialog
  });

  return (
    <div 
      {...getRootProps()} 
      className={`relative rounded-xl border-2 border-dashed p-8 transition-all duration-300 ease-in-out ${
        isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.01]' 
          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className={`rounded-full p-4 transition-colors ${
          isDragActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
        }`}>
          <Upload size={24} className={`transition-transform ${isDragActive ? 'scale-110' : ''}`} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {isDragActive ? 'Drop your files here' : 'Upload design screens'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Drag and drop up to 5 design screens (PNG, JPG, SVG), or click the button below
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={open} 
            type="button"
            variant="default"
            className="mt-2"
          >
            <FileSymlink size={16} className="mr-2" />
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
