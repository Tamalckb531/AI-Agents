import { tool } from '@langchain/core'
import { z } from 'zod';
import dotenv from "dotenv";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

//! Creating llm model for ai interaction
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY,
    model: "gemini-1.5-flash",
});

//! created tools with lang chain -> our llm gonna use that stuffs
const multiply = tool(async(({ a, b }) => {
    return a * b;
}), {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
        a: z.number().describe('first number'),
        b: z.number().describe('second number'),
    }),
}
);
const add = tool(async(({ a, b }) => {
    return a + b;
}), {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
        a: z.number().describe('first number'),
        b: z.number().describe('second number'),
    }),
}
);
const subtract = tool(async(({ a, b }) => {
    return a > b ? a - b : b - a;
}), {
    name: "subtract",
    description: "Subtract two numbers",
    schema: z.object({
        a: z.number().describe('first number'),
        b: z.number().describe('second number'),
    }),
}
);
const divide = tool(async(({ a, b }) => {
    return a / b;
}), {
    name: "Divide",
    description: "Divide two numbers",
    schema: z.object({
        a: z.number().describe('first number'),
        b: z.number().describe('second number'),
    }),
}
);

const tools = [add, multiply, subtract, divide];
const toolsByName = Object.fromEntries(tool.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools); //? This is where we give the tools context to the llm