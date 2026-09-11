const TONE_CLASSES: Record<string, string> = {
  safe: "bg-[#12352C] text-[#5DCAA5] border border-[#1D9E75]/40",
  warn: "bg-[#3A2A0C] text-[#FAC775] border border-[#BA7517]/50",
  danger: "bg-[#3C1414] text-[#F09595] border border-[#A32D2D]/50",
  neutral: "bg-[#1C2536] text-[#8FA0BF] border border-[#2B3752]",
};

export default function StatusPill({
  tone,
  children,
}: {
  tone: "safe" | "warn" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
