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
          'chromium-1140',
          'chrome-linux',
          'chrome'
        )
      : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

    const browser = await chromium.launch({
      executablePath: chromiumExecutablePath,
    });
    const page = await browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot();
    await browser.close();

    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to generate screenshot' }, { status: 500 });
  }
}
