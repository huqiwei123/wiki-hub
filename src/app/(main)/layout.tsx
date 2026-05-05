import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
// import { DynamicBackground } from "@/components/layout/dynamic-background";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-transparent">
{/* <DynamicBackground /> */}
      <Header />
      <main id="main-content" className="relative z-10 w-full flex-1">
        {children}
      </main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
