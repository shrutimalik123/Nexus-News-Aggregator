import React, { useState } from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  article: NewsItem;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => {
  const [imgSrc, setImgSrc] = useState(article.imageUrl);
  const [hasError, setHasError] = useState(false);
  
  // Stagger animation based on index
  const animationDelay = `${index * 100}ms`;

  // Ensure robust URL generation
  let href = article.sourceUrl;
  
  // Fallback to search if URL is missing, empty, or just a placeholder '#'
  if (!href || href === '#' || href.trim().length === 0) {
    href = `https://www.google.com/search?q=${encodeURIComponent(article.headline)}`;
  } else if (!href.startsWith('http')) {
    // Handle edge case where protocol might be missing
    href = `https://${href}`;
  }

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback to a clean placeholder with the source name
      setImgSrc(`https://placehold.co/800x600/1c1c1e/FFF.png?text=${encodeURIComponent(article.sourceName || 'News')}`);
    }
  };

  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1c1c1e] transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/50 border border-white/5 animate-fade-in-up h-full cursor-pointer"
      style={{ animationDelay, animationFillMode: 'backwards' }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        <img
          src={imgSrc}
          alt={article.headline}
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent opacity-60"></div>
        
        {/* Source Badge overlaid on image */}
        <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/10 shadow-lg">
              {article.sourceName || "Source"}
            </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mt-1 text-xl font-bold leading-snug text-white group-hover:text-red-400 transition-colors font-serif">
          {article.headline}
        </h3>
        <p className="mt-3 flex-1 text-base leading-relaxed text-gray-400 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Today
          </span>
          <span className="text-xs font-medium text-red-400 group-hover:text-red-300 transition-colors flex items-center gap-1">
            Read Story <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;