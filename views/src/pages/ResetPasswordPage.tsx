import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { useErrorMessage } from "../hooks/useErrorMessage";
import { apiRequest, jsonBody } from "../lib/api";

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const getErrorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("This password reset link is incomplete.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    if (password !== String(formData.get("confirmPassword"))) {
      toast.error("Those passwords don’t match.");
      return;
    }

    setBusy(true);
    try {
      await apiRequest<null>(`/forgot-password/${encodeURIComponent(token)}`, {
        method: "POST",
        body: jsonBody({ password }),
      });
      toast.success("Your password has been updated.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn’t update your password."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#73836c]">MAKE IT A NEW ONE</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        Reset password
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Choose a new password for your account.
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <SubmitButton busy={busy}>Save new password</SubmitButton>
      </form>
      <p className="mt-8 text-center text-sm text-stone-500">
        Changed your mind?{" "}
        <Link to="/login" className="font-semibold text-[#52654b] hover:text-[#34432f]">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
