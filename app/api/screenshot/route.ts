import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ encoding: 'base64' });

    return NextResponse.json({ screenshot: `data:image/png;base64,${screenshot}` });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
