import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#111318] py-12 text-white">
      <Container className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-[5px] border border-blue-400 text-blue-400">
              <BookOpenText className="size-3.5" />
            </span>
            <span className="text-sm font-bold">WikiHub</span>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-6 text-slate-400">
            A personal knowledge base and blogging platform designed for connected thinking and deep technical writing.
          </p>
          <div className="mt-5 flex gap-2">
            {["GH", "X", "in"].map((label) => (
              <Link key={label} href="#" className="grid size-9 place-items-center rounded-lg bg-[#1f232b] text-[11px] font-bold text-slate-300">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <FooterColumn title="Content" links={["All Articles", "Categories", "Tags", "Knowledge Graph"]} />
          <FooterColumn title="Resources" links={["About", "Newsletter", "RSS Feed", "Privacy Policy"]} />
          <div>
            <h3 className="text-sm font-semibold">Stay updated</h3>
            <p className="mt-3 text-xs leading-6 text-slate-400">
              Subscribe to the newsletter to get new articles and knowledge graph updates.
            </p>
            <div className="mt-4 flex h-10 overflow-hidden rounded-lg bg-[#1f232b] p-1">
              <input className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-slate-500" placeholder="Email address" />
              <button className="rounded-md bg-blue-600 px-4 text-xs font-medium">Subscribe</button>
            </div>
          </div>
        </div>
      </Container>
      <Container className="mt-12 flex border-t border-white/10 pt-6 text-xs text-slate-500">
        <span>© 2026 WikiHub. All rights reserved.</span>
        <span className="ml-auto">Made with ❤️</span>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-4 grid gap-3 text-xs text-slate-400">
        {links.map((link) => (
          <Link key={link} href="#">
            {link}
          </Link>
        ))}
      </div>
    </div>
  );
}
