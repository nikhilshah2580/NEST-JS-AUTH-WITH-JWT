export default function AuthPageFrame({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  return (
    <section className="mx-auto my-12 w-full max-w-[460px] rounded-2xl border border-[#e5e9e0] bg-[#fbfcf9] px-6 py-8 shadow-[0_16px_50px_#293b280a] sm:my-16 sm:px-9 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#71866a]">
        {eyebrow}
      </p>
      <h1 className="mb-2 mt-2 font-['Manrope'] text-3xl font-bold tracking-[-1px] text-[#202820]">
        {title}
      </h1>
      <p className="text-[13px] leading-5 text-[#7c8379]">{description}</p>
      {children}
      <p className="mt-6 text-center text-xs text-[#81887f]">{footer}</p>
    </section>
  );
}
