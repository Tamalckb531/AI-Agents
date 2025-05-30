import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
dotenv.config();

const weatherTool = tool(
    async ({ query }) => {
        console.log('query', query);

        return 'The weather in Tokyo is sunny';
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

const agent = createReactAgent({
    llm: model,
    tools: [weatherTool],
})

const result = await agent.invoke({
    messages: [{
        role: "user",
        content: "What is the weather in Chittagong?"
    }]
})

console.log(result.messages.at(-1)?.content);
