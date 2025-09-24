import Groq from "groq-sdk";
import { tavily } from '@tavily/core';
import NodeCache from "node-cache";
import dotenv from 'dotenv';
dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cache = new NodeCache({stdTTL:60*60*24}); //24 hours

export async function generate(userMessage,threadId) {
    const MAX_RETRIES = 10;
    let count = 0;

    const baseMessages = [
        {
            role: "system",
            content:
                `
                You are a smart personal assistant named 'Jarvis'. 
                - If the user asks about dates, launches, or current events, and you don't know the answer, call the webSearch tool.
                - If a webSearch result is already provided in the conversation, use that information to answer the user in plain text.
                - Do NOT call webSearch again if you already have tool output.

                The current date and time : ${new Date().toUTCString()}
            `,
        },
    ];

    const messages = cache.get(threadId) ?? baseMessages; //If in the cache nothing is there, the put the basemessages.

    messages.push({
        role: 'user',
        content: userMessage
    })
    while (true) {
        if(count>MAX_RETRIES){
            return "I Could not find result, please try again.";
        }
        count++;
        const completions = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description: "Search the latest infromation and realtime data on the internet",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to perform search on.",
                                },
                            },
                            required: ['query'],
                        },
                    },
                },
            ],
            messages: messages,
            tool_choice: 'auto'
        });
        messages.push(completions.choices[0].message)

        const assistantResponse = completions.choices[0].message;
        if (assistantResponse?.content && assistantResponse.content.startsWith('<function=')) {
            const toolCallMatch = assistantResponse.content.match(
                /<function=(\w+)\s*({.*})\s*<\/function>/
            );
            if (toolCallMatch) {
                const toolName = toolCallMatch[1];
                const toolParams = JSON.parse(toolCallMatch[2]);

                if (toolName === 'webSearch') {
                    const result = await webSearch(toolParams);
                    messages.push({
                        role: 'tool',
                        name: toolName,
                        content: result,
                        tool_call_id: Math.random().toString()
                    })
                }
            }

        }
        else {
            cache.set(threadId,messages);
            return assistantResponse.content;
        }
    }
}

async function webSearch({ query }) {
    console.log('Calling web search...');
    const response = await tvly.search(query);
    const finalResult = response.results.map(result => result.content).join('\n\n');
    return finalResult;
}