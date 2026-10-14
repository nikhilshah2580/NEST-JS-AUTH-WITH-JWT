import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <p className="py-16 text-center text-sm text-[#737a70]">
        Loading your profile…
      </p>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;

  const isAdmin = user.role === "admin";

  return (
    <section className="mx-auto my-12 grid min-h-[390px] w-full max-w-[730px] place-items-center rounded-[18px] border border-[#e5e9e0] bg-gradient-to-br from-[#fbfcf9] to-[#edf2e9] px-6 py-14 text-center sm:my-[75px]">
      <div className="max-w-[460px]">
        <span className="mx-auto mb-5 grid size-[58px] place-items-center rounded-[17px] bg-[#e2ebdc] text-2xl text-[#547b55]">
          {isAdmin ? "✦" : "⌂"}
        </span>
        <p className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[.06em] text-[#6b7868]">
          <span className="size-[7px] rounded-full bg-[#8ba979] shadow-[0_0_0_4px_#8ba97920]" />
          Your profile
        </p>
        <h1 className="mb-3 font-['Manrope'] text-4xl font-semibold tracking-[-2px] text-[#202820] sm:text-6xl sm:tracking-[-3px]">
          Welcome, {isAdmin ? "admin" : "user"}.
        </h1>
        <p className="text-sm leading-7 text-[#737c71]">
          Hi {user.username || user.email}, it&apos;s good to have you here.
        </p>
        <dl className="mt-8 space-y-3 rounded-xl border border-[#e5e9e0] bg-white/70 p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#81887f]">Name</dt>
            <dd className="font-medium text-[#39483a]">{user.username}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#81887f]">Email</dt>
            <dd className="break-all text-right font-medium text-[#39483a]">
              {user.email}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#81887f]">Role</dt>
            <dd className="font-medium capitalize text-[#39483a]">
              {user.role}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
