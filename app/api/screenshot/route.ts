import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import type { Browser, Page } from 'playwright-core';

async function getSelectorsToRemove(html: string): Promise<string[]> {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.OPENAI_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "You are an HTML analysis expert. Provide detailed JSON responses to questions related to HTML structure."
      },
      {
        "role": "user",
        "content": `I need to analyze the following HTML content to identify any overlay,dialog elements or any element that might block interaction with the main content until clicked, such as marketing overlays, dialogs or cookie messages.
         Please return a JSON response identifying any element selector that meets the above criteria. 
         If you identify an element that might be a dialog, provide any element selector as well that exist within the dialog so that it can be hidden.
         Remember to use the proper CSS selectors to target the elements.
         Use the role attribute to help identify dialog elements. ex. role="dialog" or role="alertdialog".
         Provide a json response that has the key 'selectors' and an array of selector strings to hide. 
         If possible, identify any elements as well that might be chat dialogs or chat widgets so that they can be hidden.
          Keep the selector list to just the selector id or classname.  Do not make it a complex object.
         Be sure to make it easily parseable so no code markers please. \n\nHere is the HTML content for analysis:\n\n ${html}`
      }
    ]
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);
    const selectors = content.selectors || [];
    console.log("Selectors identified by AI:", selectors);
    return selectors;
  } catch (error) {
    console.error('Error analyzing HTML:', error);
    return [];
  }
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
    
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    if (!browser) {
      throw new Error('Failed to initialize browser');
    }

    const context = await browser.newContext({
      userAgent: ua,
    });
    page = await context.newPage();

    await page.goto(url, {
      timeout: 30000,
    });

    // Additional wait to ensure dynamic content is loaded
    await page.waitForTimeout(2000);

    // Get the body content
    const bodyContent = await page.evaluate(() => document.body.outerHTML);
    
    // Get selectors to remove
    const selectorsToRemove = await getSelectorsToRemove(bodyContent);

    // Hide elements based on selectors
    for (const selector of selectorsToRemove) {
      const result = await page.evaluate((sel: string) => {
        const elements = document.querySelectorAll(sel);
        const count = elements.length;
        elements.forEach(el => {
          el.setAttribute('style', 'display: none !important');
        });
        return { count, sel };
      }, selector);
      console.log(`Removed ${result.count} elements with selector: ${result.sel}`);
    }

    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();
    console.log('Screenshot captured');

    // Convert the screenshot to a base64-encoded string
    const base64Screenshot = Buffer.from(screenshot).toString('base64');

    // Return the screenshot as a base64-encoded string in JSON
    return NextResponse.json({ 
      screenshot: `data:image/png;base64,${base64Screenshot}` 
    });
  } catch (error) {
    console.error('Screenshot generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate screenshot' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
