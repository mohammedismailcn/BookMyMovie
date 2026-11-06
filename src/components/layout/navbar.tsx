"use client";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { isBookingDestination, ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import Image from "next/image";

const links = [
  ["Movies", ROUTES.movies],
  ["Theaters", ROUTES.theaters],
  ["Offers", ROUTES.offers],
] as const;

export function Navbar() {
  const bookingFlow = isBookingDestination(usePathname());
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 lg:flex-nowrap lg:gap-6 lg:px-8">
        <Link href={ROUTES.home} aria-label="BookMyMovie home" className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
          <Image src="/assets/text_logo.png" alt="BookMyMovie" width={2172} height={724} priority sizes="(min-width: 640px) 160px, 112px" className="h-auto w-28 sm:w-40" />
        </Link>
        {!bookingFlow && <nav aria-label="Main navigation" className="order-4 flex w-full items-center justify-between gap-4 text-xs font-medium lg:order-none lg:ml-auto lg:w-auto lg:gap-6">
          {links.map(([label, href]) => <Link key={href} href={href} className="shrink-0 py-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{label}</Link>)}
        </nav>}
        <div className="flex shrink-0 items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-5">
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
