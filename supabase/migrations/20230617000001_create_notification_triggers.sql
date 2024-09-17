-- Function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_data_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.functions.supabase.co/handle-data-change',
      body := json_build_object(
        'user_id', NEW.user_id,
        'table', TG_TABLE_NAME,
        'event_type', TG_OP
      )::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for notifications table
CREATE TRIGGER notify_notification_change
AFTER INSERT OR UPDATE OR DELETE ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

-- Add similar triggers for other tables as needed