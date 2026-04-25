import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import db from "./db.js";
import { search } from "duck-duck-scrape";

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: "*" });
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_to_prevent_crash",
  baseURL: "https://api.groq.com/openai/v1",
});
fastify.get("/", async () => {
  return { status: "Backend running 🚀" };
});

fastify.post("/recommend", async (request, reply) => {
  try {
    const { userInput } = request.body || {};
    console.log("User input:", userInput);

    if (!userInput) {
      return reply.send({
        recommendations: "Please enter a movie preference.",
      });
    }

    let webContext = "";
    try {
      const searchResult = await search(`upcoming movies ${userInput} 2026`);
      if (searchResult && searchResult.results) {
        webContext = searchResult.results
          .slice(0, 4)
          .map((r) => r.title + " - " + r.description)
          .join("\n");
      }
    } catch (e) {
      console.error("Search failed:", e);
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert movie recommendation engine. The current year is 2026. Use the provided internet context to recommend the most recent or upcoming movies. Format your response STRICTLY as a list where each line is formatted exactly as 'Movie Name - A short, compelling description'. Do not include intro or outro text."
        },
        {
          role: "user",
          content: `Preference: ${userInput}.\n\nInternet Context:\n${webContext}\n\nRecommend 5 movies based on this. Only list movie names.`,
        },
      ],
    });

    const text =
      completion?.choices?.[0]?.message?.content ||
      "AI did not return output.";

    try {
      await db.run(
        `INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)`,
        [userInput, text]
      );
      console.log("Saved recommendation to DB");
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    return reply.send({ recommendations: text });
  } catch (error) {
    console.error("Backend error:", error);

    return reply.send({
      recommendations:
        "AI service failed temporarily. Please try again.",
    });
  }
});

const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: port, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
