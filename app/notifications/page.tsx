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
      <div className="overflow-x-auto mt-5">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-center">Message</th>
              <th className="px-4 py-2 border-b text-center">Read</th>
              <th className="px-4 py-2 border-b text-center">Created At</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification: Notification) => (
              <tr
                key={notification.id}
                className={notification.read ? "bg-gray-100" : "bg-white"}
              >
                <td className="px-4 py-2 border-b text-center">
                  {notification.message}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {notification.read ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {new Date(notification.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
