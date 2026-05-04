"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const resolved = !hydrated
    ? "light"
    : theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 rounded-lg bg-muted text-muted-foreground transition hover:text-foreground"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolved === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
