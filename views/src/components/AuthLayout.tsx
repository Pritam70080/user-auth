import { Link, Outlet, useLocation } from "react-router-dom";

export function AuthLayout() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <main className="min-h-screen bg-[#f7f6f3] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-[0_28px_90px_rgba(46,50,40,0.10)] sm:min-h-[calc(100vh-5rem)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#465b43] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-4 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-[#718167]/25 blur-2xl" />
          <div className="absolute bottom-16 right-8 h-52 w-52 rounded-full bg-[#d1b67a]/10 blur-3xl" />

          <Link to="/login" className="relative flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 text-lg">
              k
            </span>
            <span className="text-xl">kindred</span>
          </Link>

          <div className="relative max-w-md pb-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#d5decf]">
              A little more peace of mind
            </p>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
              {isSignup
                ? "Good things start with a simple hello."
                : "Your account, in good hands."}
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/70">
              A thoughtful, secure space to manage your account and stay connected to what matters.
            </p>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#d8b398", "#9eaa8a", "#d6c28f"].map((color) => (
                  <span
                    key={color}
                    className="h-9 w-9 rounded-full border-[3px] border-[#465b43]"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm text-white/70">Made for people, built with care</span>
            </div>
          </div>

          <p className="relative text-xs text-white/50">© 2026 Kindred. Your privacy matters.</p>
        </section>

        <section className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-5 py-12 sm:px-12 lg:min-h-0 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Link
              to="/login"
              className="mb-12 inline-flex items-center gap-2 font-semibold tracking-tight text-[#465b43] lg:hidden"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf0e9] text-lg">
                k
              </span>
              kindred
            </Link>
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
