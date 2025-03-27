
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/Button';
import { ChevronLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BackButtonProps {
  showConfirm?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ showConfirm = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  
  const handleBack = () => {
    const isResultsPage = location.pathname === '/results';
    
    if (isResultsPage && showConfirm) {
      setShowDialog(true);
    } else {
      goBack();
    }
  };
  
  const goBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className="group px-2"
      >
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Button>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              If you go back, you might lose your generated stories. Make sure to save them first if you want to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={goBack}>Yes, go back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackButton;
