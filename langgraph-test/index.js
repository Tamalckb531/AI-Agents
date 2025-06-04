import { tool } from '@langchain/core'
import { z } from 'zod';

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