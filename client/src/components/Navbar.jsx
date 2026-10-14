import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./ToastProvider";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-[#e8eee3] text-[#416e50]"
      : "text-[#667064] hover:bg-[#edf0e9] hover:text-[#202820]"
  }`;

export default function Navbar() {
  const { user, status, logout } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const error = await logout();
    setLoggingOut(false);
    if (error) {
      showToast(
        `Signed out on this device, but the API could not confirm logout: ${error.message}`,
        "error",
      );
    } else {
      showToast("You have been signed out.");
    }
    navigate("/", { replace: true });
  }

  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[#e4e8df] sm:min-h-[90px]">
      <NavLink
        className="flex items-center gap-2.5 font-['Manrope'] text-xl font-extrabold tracking-[-1px] text-[#202820] no-underline"
        to="/"
        aria-label="Northstar home"
      >
        <span className="grid size-[34px] place-items-center rounded-[11px] bg-[#e4eddf] text-xl text-[#4c7754]">
          ✳
        </span>
        <span>
          northstar<span className="text-[#88a977]">.</span>
        </span>
      </NavLink>

      <nav className="flex items-center gap-1" aria-label="Main navigation">
        <NavLink className={linkClass} to="/" end>
          Home
        </NavLink>
        {status === "loading" ? (
          <span
            className="px-3 py-2 text-sm text-[#737a70]"
            role="status"
          >
            Checking session…
          </span>
        ) : user ? (
          <>
            <NavLink className={linkClass} to="/profile">
              Profile
            </NavLink>
            <button
              className="ml-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#4f5d50] transition hover:bg-[#edf0e9] disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </>
        ) : (
          <>
            <NavLink className={linkClass} to="/signin">
              Sign in
            </NavLink>
            <NavLink
              className="rounded-lg bg-[#416e50] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#355d43]"
              to="/signup"
            >
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
