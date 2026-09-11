import { ShieldCheck } from "lucide-react";

export default function AppHeader({ userName }: { userName?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
          <ShieldCheck size={17} className="text-white" />
        </div>
        <span className="text-lg font-medium text-[#E7ECF5]">SafeTrack</span>
      </div>
      {userName && <span className="text-sm text-[#8FA0BF]">{userName}</span>}
    </div>
  );
}
