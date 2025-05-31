import { Tools } from 'unifai-sdk';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { resolve } from 'path';

const result = dotenv.config({ path: resolve(__dirname, '../.env') });

async function runAgentTest() {
  const unifaiAgentApiKey = process.env.UNIFAI_AGENT_API_KEY;
  if (!unifaiAgentApiKey) {
    console.error("error: please set UNIFAI_AGENT_API_KEY in .env file.");
    return;
  }

  const tools = new Tools({ apiKey: unifaiAgentApiKey });

  //  get available tool definitions (simulate AI getting tool list) 
  console.log("getting tool definitions from UnifAI platform...");
  const availableTools = await tools.getTools(); // use dynamic tool discovery
  console.log("successfully got tool definitions:", JSON.stringify(availableTools, null, 2));

  // simulate LLM and tool interaction loop 
  // here we will show the complete tool call process using LLM (OpenAI as an example)

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error("error: please set OPENAI_API_KEY in .env file to simulate LLM call.");
    return;
  }
  const openaiBaseUrl = process.env.BASE_URL;
  if (!openaiBaseUrl) {
    console.error("error: please set BASE_URL in .env file to simulate LLM call.");
    return;
  }
  const openai = new OpenAI({ apiKey: openaiApiKey, baseURL: openaiBaseUrl });

  let messages: any[] = [{ role: "user", content: "I need to unstake 0.0002 stETH on Lido" }];

  console.log("\n--- start simulating AI agent, LLM and tool interaction loop ---");

  let loopCount = 0;
  const MAX_LOOPS = 5; // prevent infinite loop

  while (loopCount < MAX_LOOPS) {
    loopCount++;
    console.log(`\n--- loop ${loopCount}: LLM thinking ---`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // use model that supports tool calling
      messages: messages,
      tools: availableTools, // pass UnifAI tools to LLM
      tool_choice: "auto", // allow LLM to automatically choose whether to call tools
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage); // add LLM's response to message history

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // if LLM decides to call tools, execute tool calls
      console.log(`LLM suggests calling tools:`, JSON.stringify(responseMessage.tool_calls, null, 2));
      console.log("executing tool calls...");

      const toolCallResults = await tools.callTools(responseMessage.tool_calls); // execute tool calls
      messages.push(...toolCallResults); // add tool results to message history, for LLM to process next time
      console.log("tool call results added to message history.");
    } else {
      // if LLM does not generate tool calls, output final response
      console.log("\nLLM has generated final response, no new tool calls.");
      console.log("final AI response:", responseMessage.content);
      break; // end loop
    }
  }

  if (loopCount >= MAX_LOOPS) {
    console.warn("\nreached maximum loop count, may cause infinite loop or LLM not converging.");
  }
  console.log("\n--- AI agent test completed ---");


}

runAgentTest().catch(console.error);