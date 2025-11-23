import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#1c1c1e] border border-white/5">
      <div className="animate-pulse">
        {/* Image Placeholder */}
        <div className="aspect-video w-full bg-white/5"></div>
        
        <div className="p-5 space-y-4">
          {/* Title Placeholder */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded bg-white/10"></div>
            <div className="h-6 w-1/2 rounded bg-white/10"></div>
          </div>
          
          {/* Summary Placeholder */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-white/5"></div>
            <div className="h-4 w-full rounded bg-white/5"></div>
            <div className="h-4 w-2/3 rounded bg-white/5"></div>
          </div>

          {/* Footer Placeholder */}
          <div className="pt-4 border-t border-white/5 flex justify-between">
            <div className="h-3 w-16 rounded bg-white/5"></div>
            <div className="h-3 w-20 rounded bg-white/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;