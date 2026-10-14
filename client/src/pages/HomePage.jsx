import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Feature({ icon, title, color, children }) {
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

export default function HomePage() {
  const { user, status, initializationError } = useAuth();
  return (
    <>
      {initializationError && (
        <p
          className="mb-6 rounded-lg bg-[#f8e9e5] px-4 py-3 text-sm text-[#a14e42]"
          role="alert"
        >
          {initializationError}
        </p>
      )}
      <section className="grid items-center gap-9 py-12 md:min-h-[535px] md:grid-cols-2 md:gap-12">
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
            A little space to focus on what matters. Sign in to your account or
            make a new one in just a moment.
          </p>
          {status === "loading" ? (
            <p className="mt-7 text-sm text-[#737a70]">Checking your session…</p>
          ) : user ? (
            <Link
              className="mt-7 inline-flex rounded-lg bg-[#416e50] px-5 py-3.5 font-semibold text-white transition hover:bg-[#355d43]"
              to="/profile"
            >
              Go to your profile <span className="ml-4 text-lg">→</span>
            </Link>
          ) : (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-[#416e50] px-5 py-3.5 font-semibold text-white shadow-[0_5px_12px_#416e5024] transition hover:bg-[#355d43]"
                to="/signup"
              >
                Create account <span className="ml-4 text-lg">→</span>
              </Link>
              <Link
                className="rounded-lg border border-[#d9ded4] px-5 py-3.5 font-semibold text-[#202820] transition hover:bg-[#edf0e9]"
                to="/signin"
              >
                Sign in
              </Link>
            </div>
          )}
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
        <Feature icon="⌘" title="Just for you" color="green">
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
  );
}
