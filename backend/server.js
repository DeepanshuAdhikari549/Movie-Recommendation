import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: "*" });
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
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

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        {
          role: "user",
          content: `Recommend 5 movies based on this preference: ${userInput}. Only list movie names.`,
        },
      ],
    });

    const text =
      completion?.choices?.[0]?.message?.content ||
      "AI did not return output.";

    return reply.send({ recommendations: text });
  } catch (error) {
    console.error("Backend error:", error);

    return reply.send({
      recommendations:
        "AI service failed temporarily. Please try again.",
    });
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, () => {
  console.log("Server running on http://localhost:3000");
});
