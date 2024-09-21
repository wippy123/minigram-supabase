// deno-lint-ignore-file no-explicit-any
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { TaskUpdateEmail } from './_templates/magic-link.tsx'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
 // Initialize Supabase client with your project's URL and Service Role key
 const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
 const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 
  // Function to compare two objects and return the differences
  function getChanges(oldObj: Record<string, any>, newObj: Record<string, any>): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        changes[key] = {
          old: oldObj[key],
          new: newObj[key]
        };
      }
    }
    
    return changes;
  }

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }
  const { old_record, record, event } = await req.json();
  console.log('inside hook', old_record, record, event)

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.admin.getUserById(old_record?.assigned_user_id ? old_record?.assigned_user_id : old_record?.owner_id)

  console.log('supabase data', {data, error})


  // Get the changes between old_record and record
  const changes = getChanges(old_record, record);
  delete changes.followers; // Remove the 'followers' field if it exists in the changes

  console.log('changes', changes)

  if (Object.keys(changes).length === 0) {
    return new Response(
      JSON.stringify({
        error: {
          http_code: 400,
          message: 'No changes to report',
        },
      }),
    )
  }

  // Create a readable description of the changes
  const changeDescription = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Old Value</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">New Value</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(changes).map(([key, value]) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${value.old}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${value.new}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  console.log('Changes:', changeDescription);
  if (data && data?.user?.email) {
  try {
    const html = await renderAsync(
      React.createElement(TaskUpdateEmail, {taskId: old_record?.id, taskName: old_record?.title, taskDescription: old_record?.description, taskDueDate: old_record?.due_date, changeDescription: changeDescription})
    )

    const { error } = await resend.emails.send({
      from: 'welcome <assistant@minigram.ca>',
      to: data?.user?.email,
      subject: 'A task you are involved with has been UPDATED!',
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
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  })
})  
