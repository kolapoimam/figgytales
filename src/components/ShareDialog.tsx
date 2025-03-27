
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/Button';
import { Check, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import LoginButton from '@/components/LoginButton';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onOpenChange, shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useFiles();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Share User Stories
            <button 
              onClick={() => onOpenChange(false)} 
              className="ml-auto text-gray-400 hover:text-gray-500"
            >
              <X size={18} />
            </button>
          </DialogTitle>
          <DialogDescription>
            Share this link with others to let them view your generated user stories.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <div className="bg-secondary rounded-md p-3 text-sm overflow-auto">
              {shareUrl}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-9 w-9"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        
        {!user && (
          <div className="mt-4 bg-secondary/30 p-3 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              Sign in to save your generated stories for future access and sharing.
            </p>
            <LoginButton />
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
