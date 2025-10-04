'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  filename: string;
  content: string;
  similarity: number;
  language: string;
  preview: string;
}

interface Stats {
  totalCVs: number;
  totalEmbeddings: number;
  indexed: boolean;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedCV, setSelectedCV] = useState<SearchResult | null>(null);

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = ['mobile developers', 'iOS expert', 'Android engineer', 'frontend React', 'backend Python'];

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-6xl">🔍</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Cohere CV Search
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-medium">
              Semantic search powered by AI embeddings
            </p>
            <button
                onClick={fetchStats}
                className="mt-6 px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200"
            >
              📊 Show Stats
            </button>
            {stats && (
                <div className="mt-6 inline-block bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100">
                  <p className="text-lg text-gray-800 font-semibold">
                    <span className="text-indigo-600">{stats.totalCVs}</span> CVs |
                    <span className="text-purple-600"> {stats.totalEmbeddings}</span> Indexed |
                    <span className={stats.indexed ? 'text-green-600' : 'text-orange-600'}>
                  {stats.indexed ? ' ✓ Ready' : ' ⚠ Indexing needed'}
                </span>
                  </p>
                </div>
            )}
          </header>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-indigo-100">
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
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? '⏳ Searching...' : '🔍 Search'}
              </button>
            </form>

            {/* Example Queries */}
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
                          <div className="flex gap-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full">
                        {result.language}
                      </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 font-semibold rounded-full">
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-indigo-600">
                            {(result.similarity * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600 font-medium">relevance</div>
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-3 leading-relaxed">{result.preview}</p>
                      <button className="mt-4 text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-2">
                        View full CV <span>→</span>
                      </button>
                    </div>
                ))}
              </div>
          )}

          {/* No Results Message */}
          {!loading && results.length === 0 && query && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try a different search term or check if embeddings are generated</p>
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
                      <div className="flex gap-3">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg">
                      {selectedCV.language}
                    </span>
                        <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg">
                      {(selectedCV.similarity * 100).toFixed(1)}% match
                    </span>
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