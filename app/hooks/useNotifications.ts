import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export function useNotifications() {
  const showNotification = (message: string) => {
    console.log("Showing notification", Notification, message);
    if (Notification.permission === "granted") {
      new Notification("New Notification", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("New Notification", { body: message });
        }
      });
    }

    toast(message, {
      icon: "🔔",
      duration: 5000,
    });
  };

  useEffect(() => {
    const supabase = createClientComponentClient();

    const handleInserts = async (payload: any) => {
        const { data: { user } } = await supabase.auth.getUser();
      console.log("Change received!", {payload, user});
      if (payload.new.assigned_user_id === user?.id) {
      showNotification(`New task added: ${payload.new.title}`);
      }
    };

    const handleNotifications = async (payload: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (payload.new.user_id === user?.id) {
        showNotification(`UPDATE REQUESTED OF YOU: ${payload.new.message}`);
      }
    };

    const handleTaskUpdates = async (payload: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("handleTaskUpdates", {payload, user});
      if (payload.old.assigned_user_id === user?.id || payload.new.owner_id === user?.id) {
        const action = payload.old.assigned_user_id !== payload.new.assigned_user_id ? 'reassigned' : 'updated';
        showNotification(`Task updated: ${payload.new.title}`);
      }
    };

    const handleTaskDeletes = async (payload: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("handleTaskDeletes", {payload, user});
      showNotification(`Task deleted: ${payload.old.title}`);
      
    };

    const subscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        handleInserts
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        handleTaskUpdates
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        handleTaskDeletes
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        handleNotifications
      )
      .subscribe();
    console.log("Subscribed to tasks");

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}