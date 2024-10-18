import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const chromiumExecutablePath = process.env.VERCEL
      ? path.join(
          '/vercel',
          '.cache',
          'ms-playwright',
          'chromium-1140'
        )
      : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

    const browser = await chromium.launch({
      executablePath: chromiumExecutablePath,
      args: ['--disable-http2', '--ignore-certificate-errors', '--disable-web-security']
    });

    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': ua
    });
    await page.goto(url);
    const screenshot = await page.screenshot();
    await browser.close();

    const base64Screenshot = Buffer.from(screenshot).toString('base64');

    return NextResponse.json({ 
      screenshot: `data:image/png;base64,${base64Screenshot}` 
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to generate screenshot' }, { status: 500 });
  }
}
