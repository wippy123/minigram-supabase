import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import os from 'os';
import { Jimp} from "jimp";

export const maxDuration = 60;

const isProduction = process.env.NODE_ENV === 'production';

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
  const { url } = await request.json();

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
   
    const screenshot = await page.screenshot({ fullPage: true });
    
    const croppedScreenshot = await cropImage(screenshot as Buffer, 0, 0, 800, 800);
    console.log('croppedScreenshot', croppedScreenshot);
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
