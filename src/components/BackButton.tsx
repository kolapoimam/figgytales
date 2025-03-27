
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { ChevronLeft } from 'lucide-react';
import { useFiles } from '@/context/FileContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface BackButtonProps {
  showConfirm?: boolean;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  showConfirm = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const { stories, user } = useFiles();

  const handleBack = () => {
    // If we're on the results page with stories and no user is logged in, show confirmation
    const shouldConfirm = showConfirm && stories.length > 0 && !user;
    
    if (shouldConfirm) {
      setShowDialog(true);
    } else {
      navigate(-1);
    }
  };

  const confirmNavigate = () => {
    setShowDialog(false);
    navigate(-1);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleBack}
        className={`group ${className}`}
      >
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard generated stories?</AlertDialogTitle>
            <AlertDialogDescription>
              You are not signed in. If you go back, you will lose all your generated stories. 
              Would you like to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigate}>Yes, go back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackButton;
