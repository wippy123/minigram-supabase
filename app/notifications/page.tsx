import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddNotification from "@/components/AddNotification";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return <div>Error loading notifications</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">All Notifications</h1>
      <AddNotification userId={user.id} />
      <ul className="space-y-4 mt-5">
        {notifications.map((notification: Notification) => (
          <li
            key={notification.id}
            className={`p-4 border rounded ${notification.read ? "bg-gray-100" : "bg-white"}`}
          >
            <p>{notification.message}</p>
            <small className="text-gray-500">
              {new Date(notification.created_at).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
