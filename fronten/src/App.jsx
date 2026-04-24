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
      // Use local backend URL for testing, or deploy URL if needed.
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

  return (
    <div className="layout-wrapper">
      <div className="glow-effect"></div>
      <main className="main-content">
        <header className="header">
          <div className="badge">AI-Powered</div>
          <h1>Find Your Next Movie</h1>
          <p>Describe your mood, genre, or favorite actors, and our engine will curate the perfect watchlist.</p>
        </header>

        <section className="form-section">
          <textarea
            className="text-input"
            placeholder="e.g., A psychological thriller with a plot twist..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button 
            className="submit-button"
            onClick={getRecommendations} 
            disabled={loading}
          >
            {loading ? "Analyzing preferences..." : "Generate Recommendations"}
          </button>
        </section>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <section className="result-section">
            <h2 className="result-title">Curated For You</h2>
            <div className="result-text">
              {result.split('\n').map((line, idx) => {
                if (!line.trim()) return null;
                return <p key={idx} className="result-item">{line}</p>;
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
