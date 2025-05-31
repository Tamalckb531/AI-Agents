import express from 'express'
import dotenv from "dotenv";
import cors from "cors";
import { agent } from './agent.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

const port = 3001;

app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.post('/generate', async (req, res) => {
    const result = await agent.invoke({
        messages: [{
            role: 'user',
            content: 'Whats the weather in Chittagong ?'
        }],
    },
        {
            configurable: { thread_id: 42 },
        });

    res.json(result.messages.at(-1)?.content);
})

app.listen(port, () => {
    console.log("Server is running on port : ", port);
});