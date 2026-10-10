import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useErrorMessage } from "../hooks/useErrorMessage";
import { apiRequest, type User } from "../lib/api";

export function VerifyPage() {
  const { token } = useParams();
  const getErrorMessage = useErrorMessage();
  const started = useRef(false);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("We’re confirming your email address…");

  useEffect(() => {
    if (!token || started.current) {
      return;
    }
    started.current = true;

    void apiRequest<User>(`/verify/${encodeURIComponent(token)}`)
      .then((response) => {
        setState("success");
        setMessage(response.message || "Your email address is verified.");
        toast.success("Email verified. You can sign in now.");
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(getErrorMessage(error, "This verification link is invalid or has expired."));
        toast.error(getErrorMessage(error, "Email verification failed."));
      });
  }, [getErrorMessage, token]);

  return (
    <div className="text-center">
      <div
        className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${
          state === "error" ? "bg-rose-50 text-rose-600" : "bg-[#edf0e9] text-[#52654b]"
        }`}
      >
        {state === "loading" ? (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#cbd4c5] border-t-[#52654b]" />
        ) : (
          <span className="text-2xl" aria-hidden="true">
            {state === "success" ? "✓" : "!"}
          </span>
        )}
      </div>
      <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#73836c]">
        EMAIL VERIFICATION
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        {state === "success" ? "You’re all set." : state === "error" ? "Couldn’t verify" : "Just a moment"}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">{message}</p>
      {state !== "loading" && (
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-xl bg-[#52654b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#40513b]"
        >
          Go to sign in
        </Link>
      )}
    </div>
  );
}
