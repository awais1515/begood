
import { AppLogo } from "@/components/AppLogo";

export default function BeGoodTitle() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans animate-in fade-in duration-1000">
      <div className="flex flex-col items-center gap-4">
        <AppLogo className="text-primary text-6xl sm:text-8xl" />
      </div>
    </main>
  );
}
