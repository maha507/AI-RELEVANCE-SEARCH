'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  filename: string;
  content: string;
  similarity: number;
  language: string;
  preview: string;
  rerankScore?: number;
  embeddingScore?: number;
}

interface Stats {
  totalCVs?: number;
  totalEmbeddings: number;
  indexed?: boolean;
  provider?: string;
  stage1?: string;
  stage2?: string;
}

type Provider = 'cohere' | 'gemini' | 'huggingface' | 'qdrant' | 'hybrid';

export default function Home() {
  const [activeProvider, setActiveProvider] = useState<Provider>('cohere');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    cohere: Stats | null;
    gemini: Stats | null;
    huggingface: Stats | null;
    qdrant: Stats | null;
    hybrid: Stats | null;
  }>({
    cohere: null,
    gemini: null,
    huggingface: null,
    qdrant: null,
    hybrid: null,
  });
  const [selectedCV, setSelectedCV] = useState<SearchResult | null>(null);

  const fetchStats = async () => {
    try {
      const [cohereRes, geminiRes, hfRes, qdrantRes, hybridRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/stats-gemini'),
        fetch('/api/stats-hf'),
        fetch('/api/stats-qdrant'),
        fetch('/api/stats-hybrid'),
      ]);

      const [cohereData, geminiData, hfData, qdrantData, hybridData] = await Promise.all([
        cohereRes.json(),
        geminiRes.json(),
        hfRes.json(),
        qdrantRes.json(),
        hybridRes.json(),
      ]);

      setStats({
        cohere: cohereData,
        gemini: geminiData,
        huggingface: hfData,
        qdrant: qdrantData,
        hybrid: hybridData,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const endpoints: Record<Provider, string> = {
        cohere: '/api/search',
        gemini: '/api/search-gemini',
        huggingface: '/api/search-hf',
        qdrant: '/api/search-qdrant',
        hybrid: '/api/search-hybrid',
      };

      const res = await fetch(`${endpoints[activeProvider]}?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = ['mobile developers', 'iOS expert', 'Android engineer', 'frontend React', 'backend Python'];
  const currentStats = stats[activeProvider];

  const providerConfig = {
    cohere: {
      gradient: 'from-red-500 to-orange-600',
      bgLight: 'bg-red-50',
      textDark: 'text-red-700',
      icon: '🧠',
      name: 'Cohere',
      model: 'embed-english-v3.0',
      badge: 'API'
    },
    gemini: {
      gradient: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textDark: 'text-green-700',
      icon: '✨',
      name: 'Google Gemini',
      model: 'text-embedding-004',
      badge: 'Free'
    },
    huggingface: {
      gradient: 'from-yellow-500 to-amber-600',
      bgLight: 'bg-yellow-50',
      textDark: 'text-yellow-800',
      icon: '🤗',
      name: 'HuggingFace',
      model: 'all-MiniLM-L6-v2',
      badge: 'Free'
    },
    qdrant: {
      gradient: 'from-purple-500 to-pink-600',
      bgLight: 'bg-purple-50',
      textDark: 'text-purple-700',
      icon: '💾',
      name: 'Qdrant + Ollama',
      model: 'nomic-embed-text (Local)',
      badge: 'Local'
    },
    hybrid: {
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50',
      textDark: 'text-blue-700',
      icon: '⚡',
      name: 'Hybrid 2-Stage',
      model: 'HuggingFace + Cohere Rerank',
      badge: '2-Stage'
    }
  };

  const config = providerConfig[activeProvider];

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-6xl">🔍</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CV Search Comparison
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-medium mb-6">
              Compare 5 embedding approaches: API-based, Local, and Hybrid 2-Stage Retrieval
            </p>

            {/* Provider Tabs */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              <button
                  onClick={() => { setActiveProvider('cohere'); setResults([]); }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeProvider === 'cohere'
                          ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                  }`}
              >
                🧠 Cohere
              </button>
              <button
                  onClick={() => { setActiveProvider('gemini'); setResults([]); }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeProvider === 'gemini'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                  }`}
              >
                ✨ Gemini
              </button>
              <button
                  onClick={() => { setActiveProvider('huggingface'); setResults([]); }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeProvider === 'huggingface'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400'
                  }`}
              >
                🤗 HuggingFace
              </button>
              <button
                  onClick={() => { setActiveProvider('qdrant'); setResults([]); }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeProvider === 'qdrant'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  }`}
              >
                💾 Qdrant+Ollama
              </button>
              <button
                  onClick={() => { setActiveProvider('hybrid'); setResults([]); }}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeProvider === 'hybrid'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                  }`}
              >
                ⚡ Hybrid (2-Stage)
              </button>
            </div>

            <button
                onClick={fetchStats}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200"
            >
              📊 Show Stats
            </button>

            {currentStats && (
                <div className="mt-4 inline-block bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100">
                  <p className="text-lg text-gray-800 font-semibold">
                <span className={config.textDark}>
                  {config.name}:
                </span>
                    {' '}
                    <span className="text-indigo-600">{currentStats.totalEmbeddings}</span> Embeddings
                    {currentStats.indexed !== undefined && (
                        <span className={currentStats.indexed ? 'text-green-600' : 'text-orange-600'}>
                    {' | '}{currentStats.indexed ? '✓ Ready' : '⚠ Indexing needed'}
                  </span>
                    )}
                  </p>
                  {currentStats.stage1 && currentStats.stage2 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Stage 1: {currentStats.stage1} → Stage 2: {currentStats.stage2}
                      </p>
                  )}
                </div>
            )}
          </header>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-indigo-100">
            <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-lg font-bold ${config.bgLight} ${config.textDark}`}>
              {config.icon} Searching with: {config.name} ({config.model})
            </span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: 'mobile developers', 'iOS expert', 'backend Python'..."
                  className="flex-1 px-6 py-4 text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              />
              <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r ${config.gradient} disabled:from-gray-400 disabled:to-gray-500`}
              >
                {loading ? '⏳ Searching...' : '🔍 Search'}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="text-gray-700 font-semibold">Quick search:</span>
              {exampleQueries.map((example) => (
                  <button
                      key={example}
                      onClick={() => {
                        setQuery(example);
                        const form = document.querySelector('form');
                        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-all duration-200"
                  >
                    {example}
                  </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Found {results.length} results for "{query}"
                </h2>
                {results.map((result, index) => (
                    <div
                        key={result.id}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-200 cursor-pointer border-2 border-gray-100 hover:border-indigo-300"
                        onClick={() => setSelectedCV(result)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            #{index + 1} - {result.filename}
                          </h3>
                          <div className="flex gap-4 text-sm flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full">
                        {result.language}
                      </span>
                            <span className={`px-3 py-1 font-semibold rounded-full ${config.bgLight} ${config.textDark}`}>
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                            {result.rerankScore && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-semibold rounded-full text-xs">
                          Reranked: {(result.rerankScore * 100).toFixed(1)}%
                        </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-3xl font-bold ${config.textDark}`}>
                            {(result.similarity * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600 font-medium">relevance</div>
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed">{result.preview}</p>
                      <button className="mt-4 text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-2">
                        View full CV →
                      </button>
                    </div>
                ))}
              </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try a different search term or generate {config.name} embeddings first
                </p>
              </div>
          )}

          {/* CV Detail Modal */}
          {selectedCV && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                  onClick={() => setSelectedCV(null)}
              >
                <div
                    className="bg-white rounded-2xl p-8 max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedCV.filename}
                      </h2>
                      <div className="flex gap-3 flex-wrap">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg">
                      {selectedCV.language}
                    </span>
                        <span className={`px-4 py-2 font-semibold rounded-lg ${config.bgLight} ${config.textDark}`}>
                      {(selectedCV.similarity * 100).toFixed(1)}% match ({config.name})
                    </span>
                        {selectedCV.rerankScore && (
                            <span className="px-4 py-2 bg-purple-100 text-purple-800 font-semibold rounded-lg">
                        Reranked: {(selectedCV.rerankScore * 100).toFixed(1)}%
                      </span>
                        )}
                      </div>
                    </div>
                    <button
                        onClick={() => setSelectedCV(null)}
                        className="text-gray-500 hover:text-gray-700 text-4xl font-bold leading-none p-2"
                    >
                      ×
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <pre className="whitespace-pre-wrap text-base text-gray-900 leading-relaxed font-mono">
                  {selectedCV.content}
                </pre>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}