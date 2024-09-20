import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 5;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center text-gray-700 dark:text-gray-300">
        Please log in to view notifications.
      </div>
    );
  }

  const {
    data: notifications,
    error,
    count,
  } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Error fetching notifications:", error);
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Error loading notifications.
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="container mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-gray-100">
        Notifications
      </h1>
      <div className="mt-8">
        {notifications && notifications.length > 0 ? (
          <>
            <ul className="space-y-4">
              {(notifications as Notification[]).map((notification) => (
                <li
                  key={notification.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between items-center">
              <Link
                href={`/notifications?page=${Math.max(1, page - 1)}`}
                className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded ${
                  page === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Previous
              </Link>
              <span className="text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/notifications?page=${Math.min(totalPages, page + 1)}`}
                className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded ${
                  page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No notifications found.
          </p>
        )}
      </div>
    </div>
  );
}
