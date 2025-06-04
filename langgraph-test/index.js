import { tool } from '@langchain/core/tools'
import { ToolMessage } from '@langchain/core/messages'
import { z } from 'zod';
import dotenv from "dotenv";
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

//! Creating llm model for ai interaction
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY,
    model: "gemini-1.5-flash",
});

//! created tools with """LangChain""" -> our llm gonna use that stuffs
const multiply = tool(async ({ a, b }) => {
    return a * b;
},
    {
        name: "multiply",
        description: "Multiply two numbers",
        schema: z.object({
            a: z.number().describe('first number'),
            b: z.number().describe('second number'),
        }),
    }
);
const add = tool(async ({ a, b }) => {
    return a + b;
},
    {
        name: "add",
        description: "Add two numbers",
        schema: z.object({
            a: z.number().describe('first number'),
            b: z.number().describe('second number'),
        }),
    }
);
const subtract = tool(async ({ a, b }) => {
    return a > b ? a - b : b - a;
},
    {
        name: "subtract",
        description: "Subtract two numbers",
        schema: z.object({
            a: z.number().describe('first number'),
            b: z.number().describe('second number'),
        }),
    }
);
const divide = tool(async ({ a, b }) => {
    return a / b;
},
    {
        name: "Divide",
        description: "Divide two numbers",
        schema: z.object({
            a: z.number().describe('first number'),
            b: z.number().describe('second number'),
        }),
    }
);

const tools = [add, multiply, subtract, divide];
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools); //? This is where we give the tools context to the llm

//! Creating Graph with """LangGraph""" -> It wil have multiple node interconnected with each other -> each node is a process that run the llm with the tools and can also have the memory for previous context

// //? This are nodes that performs task by user with tools and llm
async function llmCall(state) {
    const result = await llmWithTools.invoke([
        {
            role: 'system',
            content: 'You are a helpful assistant tasked with performing arithmetic on a set of inputs'
        },
        ...state.messages,
    ]);

    return {
        messages: [result]
    };
}

async function toolNode(state) {
    const results = [];
    const lastMessage = state.messages.at(-1);

    if (lastMessage?.tool_calls?.length) {
        for (const toolCall of lastMessage.tool_calls) {
            const tool = toolsByName[toolCall.name];
            const observation = await tool.invoke(toolCall.args);
            results.push(
                new ToolMessage({
                    content: observation,
                    tool_call_id: toolCall.id,
                })
            )
        }
    }

    return { messages: results };
}

function shouldContinue(state) {
    const messages = state.messages;
    const lastMessage = messages.at(-1);

    //? If the LLM makes a tool call, then perform an action
    if (lastMessage?.tool_calls?.length) {
        return "Action";
    }

    //? Otherwise, we stop (reply to the user)
    return "__end__";
}

// //? Here we creating the graph that connects the nodes we created before with the tools
const agentBuilder = new StateGraph(MessagesAnnotation)
    .addNode('llmCall', llmCall)
    .addNode('tools', toolNode)
    .addEdge('__start__', "llmCall")
    .addConditionalEdges(
        'llmCall',
        shouldContinue,
        {
            "Action": "tools",
            "__end__": "__end__"
        }
    )
    .addEdge("tools", "llmCall")
    .compile()


//! Here we using our AI agent with props data

const messages = [
    {
        role: 'user',
        content: 'Add 3 and 4',
    }
];

const result = await agentBuilder.invoke({ messages });
console.log(result.messages);

