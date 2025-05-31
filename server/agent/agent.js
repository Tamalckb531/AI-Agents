import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
dotenv.config();

const weatherTool = tool(
    async ({ query }) => {
        console.log('query', query);

        return 'The weather in Chittagong is sunny';
    }, {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
        query: z.string().describe("The query to use in search")
    })
}
);


const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY,
    model: "gemini-1.5-flash",
});

//? it gives the previous asked question context to the llm
const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
    llm: model,
    tools: [weatherTool],
    checkpointSaver,
});


