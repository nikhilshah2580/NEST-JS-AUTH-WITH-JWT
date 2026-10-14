import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { accessToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Could not connect to the API. Check that the backend is running.",
    );
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError(
        "The API returned an invalid response.",
        response.status,
      );
    }
  }

  if (!response.ok) {
    const message = body?.errors?.length
      ? body.errors.join(". ")
      : body?.message;
    throw new ApiError(
      message || `Request failed (${response.status}).`,
      response.status,
    );
  }

  return body?.data ?? body;
}

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  function notify(message, isError = false) {
    setToast({ message, isError });
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const tokens = await request("/auth/refresh", { method: "POST" });
        if (!active) return;
        const profile = await request("/auth/profile", {
          accessToken: tokens.accessToken,
        });
        if (!active) return;
        setAccessToken(tokens.accessToken);
        setUser(profile);
      } catch (error) {
        if (active && error.status !== 401) {
          notify(error.message, true);
        }
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!formMode) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setFormMode(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formMode]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const isSignup = formMode === "signup";
    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    const submitButton = form.querySelector('button[type="submit"]');
    const errorElement = form.querySelector("[data-form-error]");

    submitButton.disabled = true;
    errorElement.textContent = "";
    errorElement.classList.add("hidden");

    try {
      const result = await request(endpoint, {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (isSignup) {
        setFormMode("login");
        notify("Your account is ready. Sign in to continue.");
        return;
      }

      const profile = await request("/auth/profile", {
        accessToken: result.accessToken,
      });
      setAccessToken(result.accessToken);
      setUser(profile);
      setFormMode(null);
      notify("Signed in successfully.");
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    let logoutError = null;
    try {
      await request("/auth/logout", { method: "POST", accessToken });
    } catch (error) {
      logoutError = error;
    } finally {
      setAccessToken(null);
      setUser(null);
      setLoggingOut(false);
    }

    if (logoutError) {
      notify(
        `Signed out on this device, but the API could not confirm logout: ${logoutError.message}`,
        true,
      );
      return;
    }
    notify("You have been signed out.");
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto flex min-h-screen w-[calc(100%_-_48px)] max-w-[1320px] flex-col max-sm:w-[calc(100%_-_36px)]">
      <header className="flex h-[82px] items-center justify-between border-b border-[#e4e8df] sm:h-[94px]">
        <a
          className="flex items-center gap-2.5 font-['Manrope'] text-xl font-extrabold tracking-[-1px] text-[#202820] no-underline"
          href="/"
          aria-label="Northstar home"
        >
          <span className="grid size-[34px] place-items-center rounded-[11px] bg-[#e4eddf] text-xl text-[#4c7754]">
            ✳
          </span>
          <span>
            northstar<span className="text-[#88a977]">.</span>
          </span>
        </a>
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden text-[13px] text-[#737b70] sm:inline">
            {user?.email || "Your space, made simple"}
          </span>
          {user && (
            <button
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#4f5d50] transition hover:bg-[#edf0e9] disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Log out"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center" aria-live="polite">
        {user ? (
          <section className="mx-auto my-12 grid min-h-[390px] w-full max-w-[730px] place-items-center rounded-[18px] border border-[#e5e9e0] bg-gradient-to-br from-[#fbfcf9] to-[#edf2e9] px-6 py-14 text-center sm:my-[75px]">
            <div className="max-w-[460px]">
              <span className="mx-auto mb-5 grid size-[58px] place-items-center rounded-[17px] bg-[#e2ebdc] text-2xl text-[#547b55]">
                {isAdmin ? "✦" : "⌂"}
              </span>
              <p className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[.06em] text-[#6b7868]">
                <span className="size-[7px] rounded-full bg-[#8ba979] shadow-[0_0_0_4px_#8ba97920]" />
                You&apos;re in your space
              </p>
              <h1 className="mb-3 font-['Manrope'] text-4xl font-semibold tracking-[-2px] text-[#202820] sm:text-6xl sm:tracking-[-3px]">
                Welcome, {isAdmin ? "admin" : "user"}.
              </h1>
              <p className="text-sm leading-7 text-[#737c71]">
                Hi {user.username || user.email}, it&apos;s good to have you
                here. Your space is ready whenever you are.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8eee3] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#5e7857]">
                <span className="size-1.5 rounded-full bg-[#84a574]" />
                {isAdmin ? "Administrator" : "Member"}
              </span>
            </div>
          </section>
        ) : (
          <>
            <section className="grid items-center gap-9 py-12 md:min-h-[535px] md:grid-cols-2 md:gap-12 md:py-12">
              <div className="md:pl-[5.5%]">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.06em] text-[#6b7868]">
                  <span className="size-[7px] rounded-full bg-[#8ba979] shadow-[0_0_0_4px_#8ba97920]" />
                  A calmer way to get started
                </p>
                <h1 className="my-6 font-['Manrope'] text-[clamp(52px,6vw,78px)] font-semibold leading-[1.06] tracking-[-5px] text-[#202820]">
                  Good things
                  <br />
                  start <span className="text-[#739166]">here.</span>
                </h1>
                <p className="max-w-[440px] text-base leading-8 text-[#737a70]">
                  A little space to focus on what matters. Sign in to your
                  account or make a new one in just a moment.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    className="rounded-lg bg-[#416e50] px-5 py-3.5 font-semibold text-white shadow-[0_5px_12px_#416e5024] transition hover:-translate-y-px hover:bg-[#355d43]"
                    type="button"
                    onClick={() => setFormMode("signup")}
                  >
                    Create account <span className="ml-4 text-lg">→</span>
                  </button>
                  <button
                    className="rounded-lg border border-[#d9ded4] px-5 py-3.5 font-semibold text-[#202820] transition hover:bg-[#edf0e9]"
                    type="button"
                    onClick={() => setFormMode("login")}
                  >
                    Sign in
                  </button>
                </div>
                <p className="mt-7 flex items-center gap-2 text-xs text-[#879083]">
                  <span className="grid size-5 place-items-center rounded-full bg-[#e5eddf] text-[11px] font-bold text-[#57765a]">
                    ✓
                  </span>
                  A secure, personal space for your work
                </p>
              </div>
              <div
                className="relative h-[300px] overflow-hidden rounded-2xl bg-[#e9eee4] sm:h-[360px] md:h-[410px]"
                aria-hidden="true"
              >
                <div className="absolute -left-2 top-12 h-[270px] w-[500px] rotate-[-27deg] rounded-[50%] border border-[#a9b89c]/35" />
                <div className="absolute -left-6 top-6 h-[320px] w-[535px] rotate-[28deg] rounded-[50%] border border-[#a9b89c]/35" />
                <div className="absolute right-12 top-14 size-[120px] rounded-full bg-[#d2dfc6] shadow-[0_0_0_18px_#d2dfc638,0_0_0_42px_#d2dfc61c]" />
                <div className="absolute -bottom-24 -left-[5%] h-[240px] w-[115%] rotate-[-9deg] rounded-[50%_50%_0_0] bg-[#b3c6a9]" />
                <div className="absolute -bottom-[109px] -left-[12%] h-[190px] w-[120%] rotate-[9deg] rounded-[50%_50%_0_0] bg-[#91ad87]" />
                <div className="absolute left-[8%] top-[92px] z-10 flex items-start gap-3 rounded-xl border border-white/70 bg-white/85 px-4 py-4 font-['Manrope'] text-sm font-semibold leading-6 text-[#39483a] shadow-lg sm:left-[13%] sm:top-[120px] sm:px-5 sm:text-base">
                  <span className="text-lg text-[#78946a]">✳</span>
                  <span>
                    Make room
                    <br />
                    for what matters.
                  </span>
                </div>
                <p className="absolute bottom-6 right-6 z-10 flex items-center gap-2 text-[10px] font-semibold tracking-[.12em] text-[#f7faf3]">
                  <span className="size-1.5 rounded-full bg-[#e2ebd5]" />
                  YOUR NEXT CHAPTER
                </p>
              </div>
            </section>
            <section className="grid gap-6 border-t border-[#e4e8df] py-7 sm:grid-cols-2 lg:grid-cols-4">
              <p className="font-['Manrope'] text-[15px] font-semibold leading-6 text-[#4a5648]">
                Everything you need
                <br />
                to feel right at home.
              </p>
              <Feature icon="⌘" title="Just for you">
                A personal view that feels like yours.
              </Feature>
              <Feature icon="✦" title="Simple by design" color="peach">
                Only the essentials, right where you need them.
              </Feature>
              <Feature icon="↗" title="Ready when you are" color="blue">
                Pick up right where you left off.
              </Feature>
            </section>
          </>
        )}
      </main>

      <footer className="flex min-h-[61px] items-center justify-between border-t border-[#e4e8df] text-[11px] text-[#9ba196]">
        <span>© 2026 Northstar</span>
        <span>
          Built for a fresh start <span className="ml-1 text-[#8da77d]">✳</span>
        </span>
      </footer>

      {formMode && (
        <AuthModal
          mode={formMode}
          onClose={() => setFormMode(null)}
          onModeChange={setFormMode}
          onSubmit={handleAuthSubmit}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-20 w-[calc(100vw_-_48px)] max-w-[380px] rounded-lg border px-4 py-3 text-[13px] shadow-lg ${
            toast.isError
              ? "border-[#f0d8d2] bg-[#fbfcf9] text-[#994d42]"
              : "border-[#dfe6dc] bg-[#fbfcf9] text-[#405242]"
          }`}
          role={toast.isError ? "alert" : "status"}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function Feature({ icon, title, color = "green", children }) {
  const colors = {
    green: "bg-[#e5eddf] text-[#507352]",
    peach: "bg-[#f4e9de] text-[#a87453]",
    blue: "bg-[#e7edf0] text-[#647e92]",
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-[10px] text-[17px] ${colors[color]}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <strong className="mb-1 block text-xs">{title}</strong>
        <span className="block text-[11px] leading-4 text-[#878e83]">
          {children}
        </span>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onModeChange, onSubmit }) {
  const isSignup = mode === "signup";

  return (
    <div
      className="fixed inset-0 z-10 grid place-items-center overflow-y-auto bg-[#1e2b21]/40 p-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="relative w-full max-w-[430px] rounded-2xl border border-white bg-[#fbfcf9] px-6 py-8 shadow-2xl sm:px-9"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <button
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-xl text-[#788174] hover:bg-[#edf0e9]"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71866a]">
          {isSignup ? "A fresh start" : "Welcome back"}
        </p>
        <h2
          className="mb-2 mt-2 font-['Manrope'] text-[29px] font-bold tracking-[-1px]"
          id="form-title"
        >
          {isSignup ? "Create your account" : "Sign in"}
        </h2>
        <p className="mb-6 text-[13px] leading-5 text-[#7c8379]">
          {isSignup
            ? "Set up your personal space. It only takes a minute."
            : "Enter your details and pick up where you left off."}
        </p>
        <form onSubmit={onSubmit}>
          {isSignup && (
            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-semibold text-[#465046]">
                Your name
              </span>
              <input
                className="h-11 w-full rounded-lg border border-[#dfe4db] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#adb3aa] focus:border-[#87a47e] focus:ring-4 focus:ring-[#87a47e]/15"
                name="username"
                autoComplete="name"
                maxLength={30}
                placeholder="Taylor Morgan"
                required
                autoFocus
              />
            </label>
          )}
          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-semibold text-[#465046]">
              Email address
            </span>
            <input
              className="h-11 w-full rounded-lg border border-[#dfe4db] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#adb3aa] focus:border-[#87a47e] focus:ring-4 focus:ring-[#87a47e]/15"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="you@example.com"
              required
              autoFocus={!isSignup}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#465046]">
              Password
            </span>
            <input
              className="h-11 w-full rounded-lg border border-[#dfe4db] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#adb3aa] focus:border-[#87a47e] focus:ring-4 focus:ring-[#87a47e]/15"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              maxLength={72}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              required
              pattern={
                isSignup
                  ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+"
                  : undefined
              }
              title={
                isSignup
                  ? "Use uppercase, lowercase, a number, and a symbol."
                  : undefined
              }
            />
          </label>
          {isSignup && (
            <p className="mb-4 mt-2 text-[11px] text-[#92998f]">
              Use uppercase, lowercase, a number, and a symbol.
            </p>
          )}
          <p
            className="hidden text-xs leading-5 text-[#a14e42]"
            data-form-error
            role="alert"
          />
          <button
            className="mt-5 flex w-full items-center justify-between rounded-lg bg-[#416e50] px-4 py-3 font-semibold text-white shadow-[0_5px_12px_#416e5024] transition hover:bg-[#355d43] disabled:cursor-wait disabled:opacity-60"
            type="submit"
          >
            <span>{isSignup ? "Create account" : "Sign in securely"}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[#81887f]">
          {isSignup ? "Already have an account?" : "New around here?"}{" "}
          <button
            className="font-bold text-[#527657] hover:underline"
            type="button"
            onClick={() => onModeChange(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
