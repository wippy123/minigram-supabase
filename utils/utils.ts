import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}


const getAvatarUrl = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profile_settings")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    console.log("avatar data", profile?.avatar_url);
    return profile?.avatar_url;
  };

  export { getAvatarUrl };