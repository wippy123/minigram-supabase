import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.POSTHOG_ADMIN_API_KEY) {
      throw new Error('PostHog Admin API key not configured');
    }

    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
    
    // Get the last 30 days of pageview data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Fetch pageview trends
    const pageviewResult = await fetch(`${host}/api/projects/@current/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        insight: 'TRENDS',
        events: [{
          id: '$pageview',
          name: '$pageview',
          type: 'events',
          order: 0
        }],
        date_from: startDate.toISOString(),
        date_to: endDate.toISOString(),
        interval: 'day',
      }),
    });

    // Fetch persons data
    const personsResult = await fetch(`${host}/api/projects/@current/persons/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!pageviewResult.ok || !personsResult.ok) {
      const error = !pageviewResult.ok 
        ? await pageviewResult.json() 
        : await personsResult.json();
      console.error('PostHog API Error:', error);
      throw new Error('Failed to fetch analytics data');
    }

    const [pageviewData, personsData] = await Promise.all([
      pageviewResult.json(),
      personsResult.json()
    ]);

    return NextResponse.json({ 
      pageviews: pageviewData,
      persons: personsData.results 
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 