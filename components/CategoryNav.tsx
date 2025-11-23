import React from 'react';
import { Topic } from '../types';
import { TOPICS } from '../constants';

interface CategoryNavProps {
  currentTopic: Topic;
  onTopicChange: (topic: Topic) => void;
  disabled: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ currentTopic, onTopicChange, disabled }) => {
  return (
    <div className="w-full border-b border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 py-4 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {TOPICS.map((topic) => {
            const isActive = currentTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => onTopicChange(topic)}
                disabled={disabled}
                className={`
                  whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ease-out
                  ${isActive 
                    ? 'bg-white text-black shadow-md shadow-white/10 scale-105' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {topic}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default CategoryNav;