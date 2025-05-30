import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();


const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY,
    model: "gemini-1.5-flash",
});

const agent = createReactAgent({
    llm: model,
    tools: [],
})

const result = await agent.invoke({
    messages: [{
        role: "user",
        content: "Hello, how can you help me ?"
    }]
})

console.log(result.messages.at(-1)?.content);
