import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { TaskInsertEmail } from './_templates/magic-link.tsx'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
 // Initialize Supabase client with your project's URL and Service Role key
 const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
 const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }
  const { old_record, record, event } = await req.json();
  console.log('inside hook', old_record, record, event)

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
  .from('team_members')
  .select('*')
  .eq('member_id', 'd6fc2c09-7064-4260-b4d3-36d9352163d5')

  console.log('supabase data', {data, error})
  try {


    const html = await renderAsync(
      React.createElement(TaskInsertEmail)
    )

    const { error } = await resend.emails.send({
      from: 'welcome <onboarding@resend.dev>',
      to: 'todd.w.storm@gmail.com',
      subject: 'Inserted!',
      html,
    })
    if (error) {
      throw error
    }
  } catch (error) {
    console.log('error sending email', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  })
})