// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/@onesignal/node-onesignal@2.0.1-beta1";

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '';
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const oneSignalClient = new Client({
  userAuthKey: ONESIGNAL_API_KEY,
  app: { appAuthKey: ONESIGNAL_API_KEY, appId: ONESIGNAL_APP_ID },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req: Request) => {
  const { user_id, table, event_type } = await req.json();

  // Get user's account settings
  const { data: accountSettings, error } = await supabase
    .from('account_settings')
    .select('email_notifications, push_notifications, onesignal_id')
    .eq('id', user_id)
    .single();

  if (error || (!accountSettings?.email_notifications && !accountSettings?.push_notifications)) {
    return new Response(JSON.stringify({ message: 'No notification sent' }), { status: 200 });
  }

  // Prepare notification
  const notification: any = {
    app_id: ONESIGNAL_APP_ID,
    contents: { en: `Your data in ${table} has been ${event_type}d.` },
  };

  // Add email notification if enabled
  if (accountSettings.email_notifications) {
    notification.email_subject = `Data updated in ${table}`;
    notification.email_body = `Your data in ${table} has been ${event_type}d.`;
  }

  // Add push notification if enabled
  if (accountSettings.push_notifications) {
    notification.include_external_user_ids = [accountSettings.onesignal_id];
  }

  try {
    const response = await oneSignalClient.createNotification(notification);
    console.log(response);
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: 'Error sending notification' }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Notification sent' }), { status: 200 });
});