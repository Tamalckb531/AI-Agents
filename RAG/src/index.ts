import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { DocumentInterface } from "@langchain/core/documents";
import dotenv from "dotenv";
import { Annotation } from "@langchain/langgraph";
import type { RunnableConfig } from "@langchain/core/runnables";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/dist/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";

dotenv.config();

//! The given code convert documents into embeddings which will be the building block for a Rag application

//? That is the simple documents for the vector store
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

//? Creating embeddings form the documents
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.AI_API_KEY,
  model: "models/embedding-001",
});

//? Creating a new vector store
const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(document);

//! In the given code we are creating our graph

//? Represents the state of our graph
const GraphState = Annotation.Root({
  documents: Annotation<DocumentInterface[]>({
    reducer: (x, y) => (y ? y.concat(x ?? []) : []),
  }),
  question: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  generation: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

//! Retrieval Node:

/**
 *? Retrieve documents
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */

async function retrieve(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---RETRIEVE---");
  const retriever = ScoreThresholdRetriever.fromVectorStore(vectorStore, {
    minSimilarityScore: 0.3,
    maxK: 1,
    kIncrement: 1,
  });

  const relatedDocuments = await retriever
    .withConfig({ runName: "FetchRelevantDocuments" })
    .invoke(state.question, config);

  return {
    documents: relatedDocuments,
  };
}

//! Web search Node -> Agent gonna user it if they don't find what they need from retrieve:

async function webSearch(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---Web Search---");

  const retriever = new TavilySearchAPIRetriever({
    apiKey: process.env.TV_API_KEY,
    k: 1,
  });

  const webDocuments = await retriever
    .withConfig({ runName: "FetchRelevantDocuments" })
    .invoke(state.question, config);

  return {
    documents: webDocuments,
  };
}

//! Generation Node -> This will create the main output

async function generate(
  state: typeof GraphState.State,
  config?: RunnableConfig
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE---");

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.AI_API_KEY,
    model: "gemini-1.5-flash",
    temperature: 0,
  });

  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt"); //? Generate a well written prompt for RAG work
  const ragChain = prompt.pipe(model).pipe(new StringOutputParser()); //? Feed the prompt to the model and create pipeline to parse the string output from complex ai output

  //? This executes the ragChain for the question with all documents available
  const generation = await ragChain
    .withConfig({ runName: "GenerateAnswer" })
    .invoke(
      {
        context: formatDocumentsAsString(state.documents),
        question: state.question,
      },
      config
    );

  return { generation };
}
