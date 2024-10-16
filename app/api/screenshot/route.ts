import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-http2', '--ignore-certificate-errors']
    });
    const page = await browser.newPage();

    // Wait for navigation and network idle
    await page.goto(url, {
      // waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: 6000, // 60 seconds timeout
    });

    // Additional wait to ensure dynamic content is loaded
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 2000)));
    console.log("Page loaded", page);
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    return NextResponse.json({ screenshot: `data:image/png;base64,${screenshot}` });
  } catch (error) {
    console.error('Screenshot generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate screenshot' }, { status: 500 });
  }
}
