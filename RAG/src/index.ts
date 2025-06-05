import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { DocumentInterface } from "@langchain/core/documents";
import dotenv from "dotenv";

dotenv.config();

//! That is the simple documents for the vector store
const document: DocumentInterface[] = [
  {
    pageContent:
      "JavaScript is a versatile programming language primarily used for we development",
    metadata: { id: "1" },
  },
  {
    pageContent:
      "LangChain is a powerful library for building language model applications.",
    metadata: { id: "2" },
  },
  {
    pageContent:
      "Retrieval-Augmented Generation combines retrieval based and generative models",
    metadata: { id: "3" },
  },
  {
    pageContent:
      "LangSmith ia tool that aids in the development and debugging of language model applications.",
    metadata: { id: "1" },
  },
];

//! Creating embeddings form the documents
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.AI_API_KEY,
  model: "models/embedding-001",
});

//! Creating a new vector store
const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(document);
