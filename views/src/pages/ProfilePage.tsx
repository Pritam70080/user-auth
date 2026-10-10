import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useErrorMessage } from "../hooks/useErrorMessage";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const getErrorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await logout();
      toast.success("You’ve been signed out.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn’t sign you out. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const initials = user?.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f6f3] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm sm:px-7">
          <div className="flex items-center gap-3 font-semibold tracking-tight text-[#465b43]">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#edf0e9] text-lg">
              k
            </span>
            kindred
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </header>

        <section className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="h-44 bg-[radial-gradient(circle_at_80%_20%,rgba(221,205,164,0.8),transparent_30%),linear-gradient(120deg,#465b43,#728069)] sm:h-56" />
          <div className="px-6 pb-10 sm:px-10">
            <div className="-mt-11 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid h-24 w-24 place-items-center rounded-[26px] border-4 border-white bg-[#e9ede5] text-2xl font-semibold text-[#52654b] shadow-sm">
                {initials || "K"}
              </div>
              <span className="w-fit rounded-full bg-[#edf3e9] px-3 py-1.5 text-xs font-semibold capitalize text-[#52654b]">
                {user?.role ?? "member"}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#73836c]">
                YOUR PROFILE
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                Hello, {user?.name}.
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Your account is ready whenever you are.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-100 bg-[#fbfaf8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  NAME
                </p>
                <p className="mt-2 font-medium text-stone-800">{user?.name}</p>
              </div>
              <div className="rounded-2xl border border-stone-100 bg-[#fbfaf8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  EMAIL ADDRESS
                </p>
                <p className="mt-2 break-all font-medium text-stone-800">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>
        <p className="mt-6 text-center text-xs text-stone-400">
          Your account information is private and secure.
        </p>
      </div>
    </main>
  );
}
