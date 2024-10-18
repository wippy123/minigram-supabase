import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const screenshot = await page.screenshot({ type: 'png', fullPage: true });
    const base64Screenshot = screenshot.toString('base64');

    return NextResponse.json({ screenshot: `data:image/png;base64,${base64Screenshot}` });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
