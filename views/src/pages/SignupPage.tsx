import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { useAuth } from "../hooks/useAuth";
import { useErrorMessage } from "../hooks/useErrorMessage";

export function SignupPage() {
  const { signup } = useAuth();
  const getErrorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);

    try {
      await signup(
        String(formData.get("name")),
        String(formData.get("email")),
        String(formData.get("password")),
      );
      setSubmitted(true);
      toast.success("Your account is ready. Check your inbox to verify your email.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn’t create your account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#73836c]">A FRESH START</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        Create your account
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        Just a few details and you’ll be all set.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-[#dce5d6] bg-[#f5f8f2] p-5">
          <p className="font-semibold text-[#40513b]">One last step</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            We sent you a verification link. Open it to activate your account, then come back here
            to sign in.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex text-sm font-semibold text-[#52654b] hover:text-[#34432f]"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Full name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={3}
            maxLength={50}
            placeholder="How should we call you?"
            required
          />
          <FormField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            hint="Use at least 6 characters."
            required
          />
          <SubmitButton busy={busy}>Create account</SubmitButton>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#52654b] hover:text-[#34432f]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
