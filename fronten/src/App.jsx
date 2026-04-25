import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendations = async () => {
    if (!input.trim()) {
      alert("Please enter movie preference");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000/recommend" 
        : "https://movie-recommendation-pyuc.onrender.com/recommend";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data.recommendations);
    } catch {
      setError(
        "Failed to fetch recommendations. The backend might be starting up or unreachable."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse the recommendation text into structured cards
  // Expecting format like: "1. Movie Title - Description" or "Movie Title: Description"
  const parseRecommendations = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const parsed = [];
    
    for (const line of lines) {
      // Remove leading numbers like "1. ", "2. ", or "- "
      const cleanedLine = line.replace(/^(\d+\.\s*|\-\s*)/, '');
      
      // Try to split by dash or colon
      const splitIndex = cleanedLine.indexOf('-') > -1 
        ? cleanedLine.indexOf('-') 
        : cleanedLine.indexOf(':');
        
      if (splitIndex > -1 && splitIndex < 50) { 
        const title = cleanedLine.substring(0, splitIndex).trim();
        const desc = cleanedLine.substring(splitIndex + 1).trim();
        // Remove quotes or bold from title
        const cleanTitle = title.replace(/^"|"$/g, '').replace(/^\*\*|\*\*$/g, '');
        if (cleanTitle) {
            parsed.push({ title: cleanTitle, desc });
        }
      } else {
        parsed.push({ title: cleanedLine, desc: '' });
      }
    }
    
    return parsed;
  };

  const parsedResults = result ? parseRecommendations(result) : [];

  return (
    <>
      <div className="background-aurora">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>
      
      <div className="layout-wrapper">
        <main className="main-content">
          <header className="header">
            <h1>Cinematic Discovery</h1>
            <p>Experience the next generation of AI-curated entertainment. Describe your vibe, and let our intelligence find your perfect match.</p>
          </header>

          <section className="form-section">
            <div className="input-wrapper">
              <textarea
                className="text-input"
                placeholder="I'm looking for a mind-bending sci-fi thriller with a shocking twist, similar to Inception but newer..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button 
              className="submit-button"
              onClick={getRecommendations} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loader"></div>
                  Synthesizing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Generate Watchlist
                </>
              )}
            </button>
          </section>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {result && (
            <section className="result-section">
              <h2 className="result-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00d4ff'}}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Curated Matches
              </h2>
              
              {parsedResults.length > 0 && parsedResults.some(r => r.desc) ? (
                <div className="result-grid">
                  {parsedResults.map((item, idx) => (
                    <div key={idx} className="movie-card" style={{ animationDelay: `${idx * 0.1}s`, animation: 'slideUp 0.5s both' }}>
                      <h3 className="movie-title">{item.title}</h3>
                      {item.desc && <p className="movie-desc">{item.desc}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="raw-text-fallback">
                  {result}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
