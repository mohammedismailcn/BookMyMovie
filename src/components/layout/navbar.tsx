import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin, Search, UserRound } from "lucide-react";

const links = [
  ["Movies", "/movies"],
  ["Theaters", "/theaters"],
  ["Offers", "/offers"],
  ["My Bookings", "/bookings"],
] as const;

export function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 lg:flex-nowrap lg:gap-6 lg:px-8">
        <Link href="/" aria-label="BookMyMovie home" className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
          <Image src="/assets/text_logo.png" alt="BookMyMovie" width={2172} height={724} priority className="h-auto w-44 sm:w-52" />
        </Link>
        <label className="relative ml-auto flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs lg:ml-0">
          <MapPin className="size-3.5 text-primary" aria-hidden="true" />
          <span className="sr-only">Select city</span>
          <select defaultValue="Mumbai" className="max-w-28 appearance-none bg-transparent pr-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="Mumbai">Mumbai, IND</option>
            <option value="Delhi">Delhi, IND</option>
            <option value="Bengaluru">Bengaluru, IND</option>
            <option value="Chennai">Chennai, IND</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-3" aria-hidden="true" />
        </label>
        <form action="/search" role="search" className="order-3 flex w-full items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-2 lg:order-none lg:w-40">
          <Search className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <input name="q" type="search" aria-label="Search movies and theaters" placeholder="Search" className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-ring" />
        </form>
        <nav aria-label="Main navigation" className="order-4 flex w-full items-center justify-between gap-4 overflow-x-auto text-xs font-medium lg:order-none lg:ml-auto lg:w-auto lg:gap-6">
          {links.map(([label, href]) => <Link key={href} href={href} className="shrink-0 py-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-5">
          <Link href="/bookings" aria-label="Your account and bookings" className="hidden items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs sm:flex">
            <UserRound className="size-4" aria-hidden="true" /><span>My account</span><ChevronDown className="size-3" aria-hidden="true" />
          </Link>
          <Link href="/sign-in" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Sign In</Link>
        </div>
      </div>
    </header>
  );
}
