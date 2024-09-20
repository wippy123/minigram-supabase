import ResetPasswordForm from "@/components/ResetPasswordForm";
import { Message } from "@/components/form-message";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return <ResetPasswordForm />;
}
