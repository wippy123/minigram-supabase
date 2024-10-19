import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import os from 'os';
import { Jimp } from "jimp";
import { parse } from 'node-html-parser';

export const maxDuration = 60;

const isProduction = process.env.NODE_ENV === 'production';

async function getSelectorsToRemove(html: string): Promise<string[]> {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.OPENAI_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");

  // Estimate token count (4 characters per token is a rough estimate)
  const estimatedTokens = Math.ceil(html.length / 4);
  const maxTokens = 12000; // Adjust this based on the actual limit of gpt-4o-mini

  if (estimatedTokens > maxTokens) {
    console.log(`Estimated tokens (${estimatedTokens}) exceed the limit. Splitting the request.`);
    return await splitAndAnalyzeHTML(html, myHeaders);
  }

  const raw = JSON.stringify({
    "model": "gpt-4o-mini",
    "temperature": 0.9,
    "messages": [
      {
        "role": "system",
        "content": "You are an HTML analysis expert. Provide detailed JSON responses to questions related to HTML structure."
      },
      {
        "role": "user",
        "content": `Analyze the HTML fragment.  Identify selectors for elements that might be dialogs, overlays or alertdialogs.
          Any elements that mention cookies, cookie policy, privacy policy, dialogs or modals that are open.
          If their ids or classnames mentions cookies, cookie policy, privacy policy, dialogs or modals return their selectors.
          If their content mentions cookies, cookie policy, privacy policy, dialogs or modals return their selectors.
         Use the role attribute to help identify dialog elements. ex. role="dialog" or role="alertdialog".
         Provide a json response that has the key 'selectors' and an array of selector strings to hide from the user so they have a better view of the page.
         If possible, identify any elements as well that might be chat dialogs or chat widgets so that they can be hidden.
         Do not identify any elements that if hidden, would remove content from the page.
         Do not identify images, elements with aria-labels or have roles that are not dialog, overlay or alertdialog.
         Do not identify elements such as images, videos, menus, buttons.
          Keep the selector list to just the selector id or classname.  Do not make it a complex object.
         Be sure to make it easily parseable so no code markers please. \n\nHere is the HTML content for analysis:\n\n ${html}`
      }
    ]
  });

  return await sendRequest(raw, myHeaders);
}

async function splitAndAnalyzeHTML(html: string, headers: Headers): Promise<string[]> {
  const root = parse(html);
  const elements = root.childNodes;
  const chunks: string[] = [];
  let currentChunk = '';
  const chunkSize = 8000; // Adjust this value to ensure it's below the token limit

  for (const element of elements) {
    const elementString = element.toString();
    if (currentChunk.length + elementString.length > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      if (elementString.length > chunkSize) {
        // If a single element is larger than chunkSize, split it
        for (let i = 0; i < elementString.length; i += chunkSize) {
          chunks.push(elementString.slice(i, i + chunkSize));
        }
      } else {
        currentChunk = elementString;
      }
    } else {
      currentChunk += elementString;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  const chunkPromises = chunks.map(chunk => {
    const raw = JSON.stringify({
      "model": "gpt-4o-mini",
      "temperature": 0.9,
      "messages": [
        {
          "role": "system",
          "content": "You are an HTML analysis expert. Provide detailed JSON responses to questions related to HTML structure."
        },
        {
          "role": "user",
          "content": `Analyze the HTML fragment.  Identify selectors for elements that might be dialogs, overlays or alertdialogs.
           Any elements that mention cookies, cookie policy, privacy policy, dialogs or modals that are open.
          If their ids or classnames mentions cookies, cookie policy, privacy policy, dialogs or modals return their selectors.
          If their content mentions cookies, cookie policy, privacy policy, dialogs or modals return their selectors.
         Use the role attribute to help identify dialog elements. ex. role="dialog" or role="alertdialog".
         Provide a json response that has the key 'selectors' and an array of selector strings to hide from the user so they have a better view of the page.
         If possible, identify any elements as well that might be chat dialogs or chat widgets so that they can be hidden.
         Do not identify any elements that if hidden, would remove content from the page.
         Do not identify images, elements with aria-labels or have roles that are not dialog, overlay or alertdialog.
         Do not identify elements such as images, videos, menus, buttons.
          Keep the selector list to just the selector id or classname.  Do not make it a complex object.
         Be sure to make it easily parseable so no code markers please. \n\nHere is the HTML fragment for analysis:\n\n \n\n${chunk}`
        }
      ]
    });

    return sendRequest(raw, headers);
  });

  const allSelectorsArrays = await Promise.all(chunkPromises);
  const allSelectors = allSelectorsArrays.flat();

  return Array.from(new Set(allSelectors)); // Remove duplicates
}

async function sendRequest(raw: string, headers: Headers): Promise<string[]> {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: raw,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
    const result = await response.json();
    const content = JSON.parse(result.choices?.[0].message.content);
    const selectors = content?.selectors || [];
    console.log("Selectors identified by AI:", selectors);
    return selectors;
  } catch (error) {
    console.error('Error analyzing HTML:', error);
    return [];
  }
}

function getLocalChromePath() {
  const platform = os.platform();
  switch (platform) {
    case 'win32':
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    case 'darwin':
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    case 'linux':
      return '/usr/bin/google-chrome';
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function cropImage(buffer: Buffer, x: number, y: number, width: number, height: number): Promise<Buffer> {
  
  const image = await Jimp.read(buffer);
  const croppedImage = image.crop({x, y, w:width, h:height});
  return await croppedImage.getBuffer("image/png");
}

export async function POST(request: Request) {
  const { url, bypassAdRemoval } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

  let browser;
  try {
    const launchOptions = isProduction
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: true,
          ignoreHTTPSErrors: true,
        }
      : {
          args: ['--enable-view-port', '--prevent-resizing-for-testing'],
          headless: true,
          executablePath: getLocalChromePath(),
          ignoreHTTPSErrors: true,
        };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    page.setUserAgent(ua);
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    // Additional wait to ensure dynamic content is loaded
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));
    const bodyContent = await page.evaluate(() => document.body.outerHTML);

    if (!bypassAdRemoval) {
    const selectorsToRemove = await getSelectorsToRemove(bodyContent);

    // Hide elements based on selectors
    for (const selector of selectorsToRemove) {
      const result = await page.evaluate((sel) => {
        try {
        const elements = document.querySelectorAll(sel);
        const count = elements.length;
        if (count > 0) {  
          elements.forEach(el => {
            el.setAttribute('style', 'display: none !important');
          });
          return { count, sel };
        }
      } catch (e) {
        console.log("error hiding element", e);
      }
      }, selector);
      console.log('result', result);
    }
  }

    const screenshot = await page.screenshot();
    
    const croppedScreenshot = await cropImage(screenshot as Buffer, 0, 0, 800, 800);
    const base64Screenshot = croppedScreenshot.toString('base64');
    return NextResponse.json({ screenshot: `data:image/png;base64,${base64Screenshot}` });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
