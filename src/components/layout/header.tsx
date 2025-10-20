import { Router } from "lucide-react";

export default function Header() {
  return (
    <header className="main-header flex items-center justify-center m-6">
      <div className="max-w-[var(--content-max-width)] w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Router className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Lagebild Dashboard
          </h1>
        </div>
      </div>
    </header>
  );
}
