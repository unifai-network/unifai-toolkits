import puppeteer from 'puppeteer';

export async function fetchWebPageTextContent(url: string, waitSeconds: number = 3): Promise<any> {
  let textContent = '';
  let browser;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(url, { timeout: 30_000 });
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      
      textContent = await page.evaluate(() => {
        const bodyText = document.body?.innerText;
        return bodyText ? String(bodyText) : '';
      });
    } catch (error: unknown) {
      return { 
        error: `Failed to fetch content: ${error instanceof Error ? error.message : String(error)}`,
        partialContent: textContent,
      };
    }
  } catch (error: unknown) {
    throw new Error(`Browser operation failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }

  return {
    success: true,
    textContent,
  };
}
