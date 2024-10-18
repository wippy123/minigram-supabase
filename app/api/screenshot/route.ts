import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const executablePath = await chromium.executablePath;

    const browser = await chromium.puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || '/usr/bin/google-chrome',
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    if (!(screenshot instanceof Buffer)) {
      throw new Error('Screenshot is not a Buffer');
    }

    return new NextResponse(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Screenshot generation failed:', error);
    return NextResponse.json({ error: 'Screenshot generation failed' }, { status: 500 });
  }
}
