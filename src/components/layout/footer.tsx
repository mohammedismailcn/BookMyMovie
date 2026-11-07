"use client";

import { usePathname } from "next/navigation";
import { isBookingDestination, isShowtimeSeatsRoute, ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import Image from "next/image";
import { Clapperboard, Camera, Play } from "lucide-react";

const groups = [
  { title: "Discover", links: [["Now Showing", "/movies"], ["Upcoming Releases", "/movies/upcoming"], ["Exclusive Premieres", "/movies/premieres"], ["Gift Passes & Vouchers", "/gift-cards"]] },
  { title: "Support", links: [["Help Center & FAQs", "/help"], ["Instant Ticket Reschedule", ROUTES.myBookings], ["Accessibility Facilities", "/accessibility"], ["Corporate & Private Hire", "/corporate"]] },
];

export function FooterMain() {
  const pathname = usePathname();
  const bookingFlow = isBookingDestination(pathname);
  return (
    <section aria-label="Site information" className="bg-neutral text-neutral-foreground">
      {!bookingFlow && <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-5 lg:grid-cols-4 lg:gap-12 lg:px-8">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" aria-label="BookMyMovie home" className="inline-block rounded-lg bg-white px-2">
            <Image src="/assets/text_logo.png" alt="BookMyMovie" width={2172} height={724} sizes="(min-width: 640px) 176px, 144px" className="h-auto w-36 max-w-full sm:w-44" />
          </Link>
          <p className="mt-3 max-w-64 text-xs leading-6 text-slate-200">BookMyMovie · Movie and theater booking demo.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              {group.links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div className="col-span-2 lg:col-span-1">
          <h2 className="text-sm font-semibold">Stay Connected</h2>
          <p className="mt-3 text-xs leading-6 text-slate-200">Experience cinematic alerts & weekly screening schedules first.</p>
          <div className="mt-3 flex gap-2">
            {[{ label: "Instagram", href: "https://www.instagram.com/", icon: Camera }, { label: "Movie community on Facebook", href: "https://www.facebook.com/", icon: Clapperboard }, { label: "YouTube", href: "https://www.youtube.com/", icon: Play }].map(({ label, href, icon: Icon }) => (
              <a key={href} href={href} aria-label={label} target="_blank" rel="noreferrer" className="flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4"><Icon className="size-3.5" aria-hidden="true" /></a>
            ))}
          </div>
        </div>
      </div>}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-[10px] text-slate-200 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} BookMyMovie Entertainment Technologies Inc. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-3">
            {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Settings", "/cookies"], ["Security & Compliance", "/security"]].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-secondary hover:underline">{label}</Link>)}
          </nav>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (isShowtimeSeatsRoute(pathname)) return null;
  return <footer><FooterMain /></footer>;
}
