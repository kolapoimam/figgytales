import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { useFiles } from '@/context/FileContext';
import LoginButton from '@/components/LoginButton';
import ResultsActions from '@/components/ResultsActions';
import StoriesList from '@/components/StoriesList';
import ShareDialog from '@/components/ShareDialog';
import { Loader2 } from 'lucide-react';

const Results: React.FC = () => {
  const { 
    stories, 
    clearFiles, 
    createShareLink, 
    user,
    isLoading,
    error,
    retryFetch
  } = useFiles();
  
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState('');

  const handleShareLink = async () => {
    try {
      const url = await createShareLink();
      setShareUrl(url);
      setShareDialogOpen(true);
    } catch (error) {
      console.error('Error creating share link:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <BackButton showConfirm={true} />
          </div>
          
          <ResultsActions 
            stories={stories}
            onShareClick={handleShareLink}
            onGenerateMore={() => navigate('/', { replace: true })}
            onStartOver={() => {
              clearFiles();
              navigate('/', { replace: true });
            }}
          />
        </div>

        {!user && (
          <div className="bg-secondary/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sign in to save your generated stories to your history
            </p>
            <LoginButton />
          </div>
        )}
        
        <StoriesList 
          stories={stories} 
          loading={isLoading}
          error={error}
        />
      </div>
      
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl}
      />
    </main>
  );
};

export default Results;
