import * as dotenv from 'dotenv';
import { Toolkit, ActionContext } from 'unifai-sdk';
import { fetchWebPageTextContent } from './puppeteer';

dotenv.config();

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'WebBrowser',
    description: "Fetch content from websites.",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'fetchWebPageTextContent',
    actionDescription: 'Open a web page from a given URL and return its text content.',
    payloadDescription: {
      url: {
        type: 'string',
        description: 'The URL to open'
      },
      waitSeconds: {
        type: 'number',
        description: '(Optional) The number of seconds to wait for the page to load, default 3',
        required: false,
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    const { url, waitSeconds = 3 } = payload;
    try {
      const result = await fetchWebPageTextContent(url, waitSeconds);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to fetch web page text content: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
