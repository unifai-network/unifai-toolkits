import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { checkDomainAvailability, getDomainWhoisInfo } from './domain';


async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });

  await toolkit.updateToolkit({
    name: 'Domain',
    description: "Get domain information",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'checkDomainAvailability',
    actionDescription: 'Check whether a domain is available to register or already registered.',
    payloadDescription: {
      domainName: {
        type: 'string',
        description: 'Domain name to check, e.g. "example.com"',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await checkDomainAvailability(payload.domainName);
      return ctx.result(`Domain "${payload.domainName}" is "${result}"`);
    } catch (error) {
      return ctx.result({ error: `Failed to check domain availability: ${error}` });
    }
  });

  toolkit.action({
    action: 'getDomainWhoisInfo',
    actionDescription: 'Get WHOIS information for a domain.',
    payloadDescription: {
      domainName: {
        type: 'string',
        description: 'Domain name to get WHOIS information for, e.g. "example.com"',
      },
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await getDomainWhoisInfo(payload.domainName);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get domain WHOIS information: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
