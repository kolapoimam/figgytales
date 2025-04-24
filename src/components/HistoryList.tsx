import React, { useState } from 'react';
import { useFiles } from '@/context/FileContext';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ClockIcon, Tag, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryListProps {
  className?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ className }) => {
  const { history, getHistory } = useFiles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<{id: string, name: string}[]>([]);

  if (history.length === 0) {
    return null;
  }

  const fetchAvailableTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (!error && data) {
      setAvailableTags(data);
    }
  };

  const updateHistoryTitle = async (historyId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('history')
        .update({ title: newTitle.trim() })
        .eq('id', historyId);
      
      if (!error) {
        await getHistory();
        setEditingTitle(null);
        toast.success('Title updated');
      }
    } catch (error) {
      toast.error('Failed to update title');
    }
  };

  const addTagToHistory = async (historyId: string, tagName: string) => {
    if (!tagName.trim()) return;
    
    try {
      // First find or create the tag
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName.trim())
        .single();
      
      let tagId;
      if (tagData) {
        tagId = tagData.id;
      } else {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName.trim() })
          .select('id')
          .single();
        tagId = newTag?.id;
      }
      
      // Add relationship
      if (tagId) {
        await supabase
          .from('history_tags')
          .insert({ history_id: historyId, tag_id: tagId });
        
        await getHistory();
        setNewTag('');
        toast.success('Tag added');
      }
    } catch (error) {
      toast.error('Failed to add tag');
    }
  };

  const removeTag = async (historyId: string, tagId: string) => {
    try {
      await supabase
        .from('history_tags')
        .delete()
        .eq('history_id', historyId)
        .eq('tag_id', tagId);
      
      await getHistory();
      toast.success('Tag removed');
    } catch (error) {
      toast.error('Failed to remove tag');
    }
  };

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden", className)}>
      <div 
        className="bg-secondary p-4 flex items-center justify-between cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) fetchAvailableTags();
        }}
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
              {/* Title Section with Edit */}
              <div className="flex items-start justify-between mb-2 gap-2">
                {editingTitle === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter title"
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={() => updateHistoryTitle(item.id)}
                      disabled={!newTitle.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingTitle(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <h4 
                    className="font-medium flex-1 cursor-pointer hover:underline"
                    onClick={() => {
                      setEditingTitle(item.id);
                      setNewTitle(item.title || '');
                    }}
                  >
                    {item.title || format(new Date(item.timestamp), 'PPpp')}
                  </h4>
                )}
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                  {item.stories.length} stories
                </span>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags?.map((tag) => (
                  <span 
                    key={tag.id} 
                    className="text-xs bg-secondary px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <Tag size={12} />
                    {tag.name}
                    <button 
                      onClick={() => removeTag(item.id, tag.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-xs bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                      <Plus size={12} /> Add Tag
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="New tag name"
                        className="text-xs h-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTagToHistory(item.id, newTag);
                          }
                        }}
                      />
                      <div className="max-h-40 overflow-y-auto">
                        {availableTags.map((tag) => (
                          <div 
                            key={tag.id}
                            className="text-xs p-1 hover:bg-secondary cursor-pointer rounded"
                            onClick={() => addTagToHistory(item.id, tag.name)}
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Stories and Date */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(item.timestamp), 'PPpp')}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
