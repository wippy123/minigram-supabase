import { NextResponse } from 'next/server';
import {  supabase } from '@/lib/supabaseClient';
export async function GET() {
  try {
    if (!process.env.POSTHOG_ADMIN_API_KEY) {
      throw new Error('PostHog Admin API key not configured');
    }

    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Keep existing fetches
    const [pageviewResult, usersResult, countriesResult, personsResult, countryInsights, appInsights, browserInsights] = await Promise.all([
      // Existing pageview trends fetch
      fetch(`${host}/api/projects/98915/insights/trend/`, {
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
      }),

      // Existing users trend fetch
      fetch(`${host}/api/projects/98915/insights/trend/`, {
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
            math: 'dau',
            order: 0
          }],
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
          interval: 'day',
        }),
      }),

      // Existing countries trend fetch
      fetch(`${host}/api/projects/98915/insights/trend/`, {
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
            math: 'unique_group',
            math_group_type_index: 0,
            properties: [{
              key: '$geoip_country_code',
              operator: 'is_not',
              value: '',
              type: 'event'
            }],
            order: 0
          }],
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
          interval: 'day',
        }),
      }),

      // Existing persons fetch
      fetch(`${host}/api/projects/98915/persons/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }),

      // New country fetch
      fetch(`${host}/api/projects/98915/insights/2033242/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }),
     // New custom insight fetch
     fetch(`${host}/api/projects/98915/insights/2033490/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }),
      // New browser/device insights fetch
      fetch(`${host}/api/projects/98915/insights/2034259/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.POSTHOG_ADMIN_API_KEY}`,
          'Content-Type': 'application/json'
        },
      })
    ]);


    if (!pageviewResult.ok || !personsResult.ok || !usersResult.ok || 
        !countriesResult.ok || !countryInsights.ok || !appInsights.ok ||
        !browserInsights.ok) {
      const error = await Promise.any([
        pageviewResult, 
        personsResult, 
        usersResult, 
        countriesResult,
        countryInsights,
        appInsights,
        browserInsights
      ].filter(r => !r.ok).map(r => r.json()));
      
      console.error('PostHog API Error:', error);
      throw new Error('Failed to fetch analytics data');
    }

    const [pageviewData, personsData, usersData, countriesData, customInsightData, appInsightsData, browserInsightsData] = await Promise.all([
      pageviewResult.json(),
      personsResult.json(),
      usersResult.json(),
      countriesResult.json(),
      countryInsights.json(),
      appInsights.json(),
      browserInsights.json()
    ]);


    const filteredAppInsights = async (insights: any[]) => {
      const { data: minigrams } = await supabase
        .from('minigraphs')
        .select('*');


      if (!minigrams || !Array.isArray(insights)) {
        console.log('Missing required data or insights is not an array');
        return [];
      }

      // Filter and transform the insights array
      const filteredResults = insights.filter(insight => {
        if (!insight?.label) return false;
        const insightLabel = String(insight.label);
        const matchingMinigram = minigrams.find(minigram => 
          minigram?.url && insightLabel.includes(minigram.url)
        );
        
        if (matchingMinigram) {
          // Update the insight label to use the minigram name
          insight.label = matchingMinigram.name;
          return true;
        }
        return false;
      });

      return filteredResults;
    };

    const filteredInsights = await filteredAppInsights(appInsightsData.result);


    return NextResponse.json({ 
      pageviews: pageviewData,
      persons: personsData.results,
      users: usersData,
      countryInsights: customInsightData.result,
      appInsights: filteredInsights,
      browserInsights: browserInsightsData.result
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 