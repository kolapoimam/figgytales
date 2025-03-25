
import React, { useState } from 'react';
import { useFiles } from '@/context/FileContext';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryListProps {
  className?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ className }) => {
  const { history } = useFiles();
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden", className)}>
      <div 
        className="bg-secondary p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ClockIcon size={16} className="text-primary" />
          <h3 className="font-medium">Generation History</h3>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {isExpanded && (
        <div className="p-4 divide-y divide-border">
          {history.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(item.timestamp), 'PPpp')}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                  {item.stories.length} stories
                </span>
              </div>
              <div className="text-sm">
                {item.stories.map((story) => (
                  <div key={story.id} className="mb-1 truncate">{story.title}</div>
                )).slice(0, 2)}
                {item.stories.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + {item.stories.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
