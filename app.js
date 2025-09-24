import { json } from "express";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// async function main() {
//     const completion = await groq.chat.completions.create({
//         model: "llama-3.3-70b-versatile",
//         //temperature:1,  //Range 0-2
//         //top_p:0.2,  //Range : 0-1 , From temperature and top_p we can only use one out of two.
//         //stop:'tive', // Output will be Nega, i.e. This parameter help to stop the LLM at some particular arguments
//         //max_completion_tokens:1000,
//         // frequency_penalty:1,
//         // presence_penalty:1,
//         response_format:{type:"json_object"}, //It ensures 100% structured output generation
//         messages: [
//             {
//                 role: "system",
//                 content: `You are Jarvis, a smart review grader. Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative. Output must be a single word.
//                 You must return result in valid JSON structure.
//                 Example: {"setiment":'string'}` //Structure output via Few shot prommpting, but iit may sometime failed to give structured output.
//             },
//             {
//                 role: 'user',
//                 content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
//                 Sentiment: `
//             }
//         ]
//     })
//     // console.log(JSON.parse(completion.choices[0].message.content));
//     console.log(completion.choices[0].message.content)
// }

// main();


async function Main() {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_format:{type:'json_object'},
        messages: [
            {
                role: 'system',
                content: `
                    content: N You are an interview grader assistant.Your task is to generate candidate evaluation score. Output must be following JSON structure:
                    {
                        "confidence": number (1-10 scat),
                        "accuracy": number (1-10 scale),
                        "pass" :boolean (true or false)
                    }
                        The response must:
                            1.Include ALL fields shown above
                            2.Use only the exact field names shown
                            3.Follow the exact data types specified
                            4.Contain ONLY the JSON object and nothing else
                `,
            },
            {
                role:'user',
                content:`
                    Q: What does == do in JavaScript?
                    A:It checks strict equality-both value and type must match.

                    Q: How do you create a promise that resolves after 1 second?
                    A: const p = new Promise(r => setTimeout(r, 1000));

                    Q: What is hoisting?
                    A: JavaScript moves declarations (but not initializations) to the top of their scope before code runs.

                    Q: Why use let instead of var?
                    A: let is block-scoped, avoiding the function-scope quirks and re-declaration issues of var.
                `
            }
        ]
    })
    console.log(completion.choices[0].message.content)
}

Main();