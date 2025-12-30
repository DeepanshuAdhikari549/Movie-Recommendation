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
      const response = await fetch(
        "https://movie-recommendation-pyuc.onrender.com/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userInput: input,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data.recommendations);
    } catch {
      setError(
        "Backend is waking up (Render free tier). Please wait 30–60 seconds and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>🎬 Movie Recommendation AI</h1>

      <textarea
        placeholder="Enter your movie preference (e.g. action indian)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={getRecommendations} disabled={loading}>
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h3>Recommended Movies:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
