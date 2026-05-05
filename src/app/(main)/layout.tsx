import { Header } from "@/components/layout/header";
// import { DynamicBackground } from "@/components/layout/dynamic-background";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-transparent">
{/* <DynamicBackground /> */}
      <Header />
      <main className="relative z-10 w-full flex-1">
        {children}
      </main>
    </div>
  );
}
