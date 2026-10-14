import { useState } from "react";

export default function AuthForm({
  mode,
  onSubmit,
  serverError,
  isSubmitting,
}) {
  const isSignup = mode === "signup";
  const [validationError, setValidationError] = useState("");
  const error = validationError || serverError;

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    if (
      isSignup &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(
        values.password,
      )
    ) {
      setValidationError(
        "Use uppercase, lowercase, a number, and a symbol in your password.",
      );
      return;
    }

    await onSubmit(values);
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      {isSignup && (
        <label className="block">
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

      <label className="block">
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
        />
      </label>

      {isSignup && (
        <p className="text-[11px] text-[#92998f]">
          Use uppercase, lowercase, a number, and a symbol.
        </p>
      )}

      {error && (
        <p
          id="auth-form-error"
          className="rounded-lg bg-[#f8e9e5] px-3 py-2 text-xs leading-5 text-[#a14e42]"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      <button
        className="flex w-full items-center justify-between rounded-lg bg-[#416e50] px-4 py-3 font-semibold text-white shadow-[0_5px_12px_#416e5024] transition hover:bg-[#355d43] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <span>
          {isSubmitting
            ? isSignup
              ? "Creating account…"
              : "Signing in…"
            : isSignup
              ? "Create account"
              : "Sign in securely"}
        </span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
