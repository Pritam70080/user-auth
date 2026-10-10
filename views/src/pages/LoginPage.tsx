import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { useAuth } from "../hooks/useAuth";
import { useErrorMessage } from "../hooks/useErrorMessage";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const getErrorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);

    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      toast.success("Welcome back.");
      navigate("/profile", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn’t sign you in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#73836c]">WELCOME BACK</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Sign in</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Pick up right where you left off.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField label="Email address" name="email" type="email" autoComplete="email" required />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-stone-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[#52654b] hover:text-[#34432f]"
            >
              Forgot password?
            </Link>
          </div>
          <FormField
            id="password"
            label=""
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </div>
        <SubmitButton busy={busy}>Sign in to your account</SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        New to Kindred?{" "}
        <Link to="/signup" className="font-semibold text-[#52654b] hover:text-[#34432f]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
