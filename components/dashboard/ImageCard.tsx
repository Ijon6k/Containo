import React from 'react';
import { Trash2, Box, HardDrive, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ImageCardProps {
  image: {
    id: string;
    repoTags: string[];
    size: number;
    created: number;
  };
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ImageCard = ({ image: img, onDelete, isSelected = false, onToggleSelect }: ImageCardProps) => {
  const sizeGB = (img.size / (1024 ** 3)).toFixed(2);
  const date = formatDistanceToNow(new Date(img.created * 1000), { addSuffix: true });

  return (
    <div className={`hover:bg-white/[0.01] transition-all border-b border-white/[0.05] ${isSelected ? 'bg-brand/5' : ''}`}>
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center group">
        {/* Checkbox Column */}
        <div className="col-span-1 flex items-center">
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-ui-border accent-brand cursor-pointer"
          />
        </div>

        {/* Repo Tags Column */}
        <div className="col-span-4 min-w-0">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-brand shrink-0" />
            <h3 className="text-sm font-semibold text-text-main truncate">
              {img.repoTags[0]}
            </h3>
          </div>
          {img.repoTags.length > 1 && (
             <p className="text-[8px] text-text-sub mt-1">+{img.repoTags.length - 1} more tags</p>
          )}
        </div>

        {/* ID Column */}
        <div className="col-span-2">
          <p className="text-xs text-text-sub font-mono tracking-tight">
            {img.id}
          </p>
        </div>

        {/* Size Column */}
        <div className="col-span-2 flex items-center gap-2">
           <HardDrive className="w-3 h-3 text-text-sub" />
           <span className="text-xs font-semibold text-text-main font-mono">{sizeGB} GB</span>
        </div>

        {/* Created Column */}
        <div className="col-span-2 flex items-center gap-2">
           <Calendar className="w-3 h-3 text-text-sub" />
           <span className="text-xs font-semibold text-text-main">{date}</span>
        </div>

        {/* Actions Column */}
        <div className="col-span-1 flex justify-end">
          <button 
            onClick={() => onDelete(img.repoTags[0])}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 text-text-sub hover:text-rose-500 transition-colors"
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
