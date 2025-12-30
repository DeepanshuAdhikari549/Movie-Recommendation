import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getMovies = async () => {
    if (!input.trim()) {
      alert("Please enter something");
      return;
    }

    setLoading(true);
    setMovies("");
    setError("");

    try {
      const res = await fetch("http://localhost:3000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: input }),
      });


      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      console.log("Frontend received:", data);

      if (data.recommendations) {
        setMovies(data.recommendations);
      } else {
        setError("No recommendations received");
      }
    } catch (err) {
      console.error("Frontend error:", err);
      setError("Backend error. Check server console.");
    } finally {
     
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🎬 Movie Recommendation AI</h1>

      <textarea
        rows={4}
        style={{ width: "100%", padding: 10 }}
        placeholder="e.g. action movies with strong female lead"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={getMovies} disabled={loading}>
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {movies && (
        <pre style={{ background: "#f4f4f4", padding: 15 }}>
          {movies}
        </pre>
      )}
    </div>
  );
}
