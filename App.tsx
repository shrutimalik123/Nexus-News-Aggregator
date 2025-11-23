import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import NewsCard from './components/NewsCard';
import SkeletonCard from './components/SkeletonCard';
import { fetchNews } from './services/geminiService';
import { Topic, NewsItem, NewsSource } from './types';
import { TOPICS } from './constants';

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<Topic>(TOPICS[0]);
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (topic: Topic) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate slight network delay for better UX on fast responses
      // and to show off the skeleton loader
      const [data] = await Promise.all([
        fetchNews(topic),
        new Promise(resolve => setTimeout(resolve, 800)) 
      ]);
      
      setArticles(data.articles);
      setSources(data.sources);
    } catch (err) {
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(currentTopic);
  }, [currentTopic, loadNews]);

  const handleTopicChange = (topic: Topic) => {
    if (topic !== currentTopic && !loading) {
      setCurrentTopic(topic);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-red-500/30 selection:text-red-200 font-sans">
      <Header />
      
      <main className="pb-20">
        <CategoryNav 
          currentTopic={currentTopic} 
          onTopicChange={handleTopicChange}
          disabled={loading}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section for Content */}
          <div className="mb-8 space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight font-serif">{currentTopic}</h2>
            <p className="text-gray-400">
              Curated by Gemini AI &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content Grid */}
          {error ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-center p-8">
              <p className="text-red-400 mb-4 text-lg">{error}</p>
              <button 
                onClick={() => loadNews(currentTopic)}
                className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={`skeleton-${i}`} />
                  ))
                : articles.map((article, index) => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      index={index} 
                    />
                  ))
              }
            </div>
          )}

          {/* Sources / Grounding Footer */}
          {!loading && sources.length > 0 && (
            <div className="mt-16 border-t border-white/10 pt-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Sources & Grounding Data
              </h4>
              <div className="flex flex-wrap gap-2">
                {sources.slice(0, 10).map((source, idx) => (
                  <a 
                    key={`${source.uri}-${idx}`}
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;