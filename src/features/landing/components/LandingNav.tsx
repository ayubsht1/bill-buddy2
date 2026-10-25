import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/dashboard/mode-toggle";
import { UserDropdown } from "@/components/user-dropdown";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface LandingNavProps {
  isScrolled: boolean;
  activeSection: string;
  isAuthenticated: boolean;
  status: string;
}

export const LandingNav = ({
  isScrolled,
  activeSection,
  isAuthenticated,
  status,
}: LandingNavProps) => {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-3 md:px-6">
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 md:px-5 ${
          isScrolled
            ? "border-border/80 bg-background/90 shadow-lg backdrop-blur-xl"
            : "border-white/20 bg-black/20 shadow-sm backdrop-blur-md"
        }`}
      >
        <Link
          href="/"
          className={`text-base font-bold tracking-tight transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
        >
          Bill <span className="text-primary">Buddy</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "text-primary"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          )}

          {[
            { id: "features", label: "Features" },
            { id: "how-it-works", label: "How It Works" },
            { id: "contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                activeSection === item.id
                  ? "text-primary"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {status === "loading" ? (
            <div className="h-9 w-20" />
          ) : isAuthenticated ? (
            <UserDropdown />
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className={`h-9 px-3 text-[13px] ${
                    isScrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="h-9 rounded-lg px-4 text-[13px] shadow-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
