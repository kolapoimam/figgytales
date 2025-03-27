
import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { ClipboardCopy, Download, Check, Share2, Plus } from 'lucide-react';
import { toast } from "sonner";
import { UserStory } from '@/lib/types';

interface ResultsActionsProps {
  stories: UserStory[];
  onShareClick: () => void;
  onGenerateMore: () => void;
  onStartOver: () => void;
}

const ResultsActions: React.FC<ResultsActionsProps> = ({ 
  stories, 
  onShareClick, 
  onGenerateMore,
  onStartOver
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const copyAllToClipboard = () => {
    if (stories.length === 0) return;
    
    const textToCopy = stories.map((story, i) => 
      `${story.title}\n${story.description}\n\nAcceptance Criteria:\n${
        story.criteria.map((c, j) => `${j + 1}. ${c.description}`).join('\n')
      }${i < stories.length - 1 ? '\n\n' + '-'.repeat(40) + '\n\n' : ''}`
    ).join('');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("All stories copied to clipboard");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const downloadAsCsv = () => {
    if (stories.length === 0) return;
    
    let csvContent = "Title,Description,Acceptance Criteria\n";
    
    stories.forEach(story => {
      const criteriaText = story.criteria.map(c => 
        c.description.replace(/"/g, '""')
      ).join(' | ');
      
      csvContent += `"${story.title.replace(/"/g, '""')}","${
        story.description.replace(/"/g, '""')
      }","${criteriaText}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'figgytales-stories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV file downloaded");
  };

  const handleShare = () => {
    setIsSharing(true);
    onShareClick();
    setIsSharing(false);
  };

  return (
    <div className="flex flex-wrap gap-3 self-end sm:self-auto">
      <Button 
        variant="outline" 
        onClick={onStartOver}
        className="group"
      >
        Start Over
      </Button>
      
      <Button 
        variant="secondary" 
        onClick={copyAllToClipboard}
        disabled={stories.length === 0}
      >
        {isCopied ? <Check size={16} className="mr-2" /> : <ClipboardCopy size={16} className="mr-2" />}
        {isCopied ? 'Copied' : 'Copy All'}
      </Button>
      
      <Button
        variant="secondary"
        onClick={handleShare}
        disabled={isSharing || stories.length === 0}
      >
        <Share2 size={16} className="mr-2" />
        Share
      </Button>
      
      <Button 
        onClick={downloadAsCsv}
        disabled={stories.length === 0}
      >
        <Download size={16} className="mr-2" />
        Download CSV
      </Button>
      
      {stories.length > 0 && (
        <Button 
          onClick={onGenerateMore}
          className="group"
        >
          <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" />
          Generate More Stories
        </Button>
      )}
    </div>
  );
};

export default ResultsActions;
