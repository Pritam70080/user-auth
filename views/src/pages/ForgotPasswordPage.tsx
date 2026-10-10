import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { apiRequest, jsonBody } from "../lib/api";
import { useErrorMessage } from "../hooks/useErrorMessage";

export function ForgotPasswordPage() {
  const getErrorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);

    try {
      await apiRequest<null>("/forgot-password", {
        method: "POST",
        body: jsonBody({ email: String(formData.get("email")) }),
      });
      setSent(true);
      toast.success("If the address is registered, a reset link is on its way.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn’t start the password reset."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#73836c]">ACCOUNT RECOVERY</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        Forgot your password?
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Enter the email address on your account and we’ll send you a reset link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-[#dce5d6] bg-[#f5f8f2] p-5">
          <p className="font-semibold text-[#40513b]">Check your inbox</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Follow the link in the email to choose a new password.
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FormField label="Email address" name="email" type="email" autoComplete="email" required />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-stone-500">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-[#52654b] hover:text-[#34432f]">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
