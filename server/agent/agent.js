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

const agent = createReactAgent({
    llm: model,
    tools: [weatherTool],
    checkpointSaver,
});

//? All agent invoke should have same id in configurable for having the context
const result = await agent.invoke({
    messages: [{
        role: "user",
        content: "What is the weather in Chittagong?"
    }]
},
    {
        configurable: { thread_id: 1 }
    }
)

const followup = await agent.invoke({
    messages: [{
        role: "user",
        content: "What city is that for?"
    }]
},
    {
        configurable: { thread_id: 1 }
    }
)

console.log(result.messages.at(-1)?.content);
console.log(followup.messages.at(-1)?.content);
