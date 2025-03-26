import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/Button';
import { Upload, FileSymlink, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const FileUploader: React.FC = () => {
  const { addFiles, files, removeFile, isGenerating } = useFiles();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isGenerating) {
      toast.warning('Please wait for current generation to complete');
      return;
    }

    if (files.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      await addFiles(acceptedFiles);
      toast.success(`Added ${acceptedFiles.length} file(s)`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process files');
      toast.error('Some files failed to upload');
    } finally {
      setIsUploading(false);
    }
  }, [addFiles, files.length, isGenerating]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    noClick: true,
    maxFiles: 5,
    disabled: isGenerating
  });

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData?.files.length) return;
      
      const pastedFiles = Array.from(e.clipboardData.files)
        .filter(file => file.type.startsWith('image/') || file.type === 'application/pdf');
      
      if (pastedFiles.length > 0) {
        e.preventDefault();
        await onDrop(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onDrop]);

  // File type validation
  const validateFile = (file: File) => {
    const validTypes = [
      'image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'application/pdf'
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.name}`);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`relative rounded-xl border-2 border-dashed p-6 transition-all ${
          isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.01]' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        } ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className={`rounded-full p-3 transition-colors ${
            isDragActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
          }`}>
            {isUploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Upload size={24} className={`transition-transform ${isDragActive ? 'scale-110' : ''}`} />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-medium">
              {isUploading ? 'Processing files...' : 
               isDragActive ? 'Drop your files here' : 'Upload design files'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Supports PNG, JPG, SVG, WEBP, PDF (max 15MB each)
            </p>
          </div>
          
          <Button 
            onClick={open} 
            type="button"
            variant="default"
            size="sm"
            disabled={isUploading || isGenerating}
            className="mt-2"
          >
            <FileSymlink size={16} className="mr-2" />
            {files.length > 0 ? 'Add More Files' : 'Select Files'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
