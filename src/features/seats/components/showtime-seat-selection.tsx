"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useMockBookings } from "@/features/bookings/hooks/use-mock-bookings";
import { applyConfirmedBookings } from "@/features/bookings/services/booking-availability";
import { confirmMockBooking } from "@/features/bookings/services/mock-booking-service";
import { useAuth } from "@/features/auth/components/auth-provider";
import { loadSeatPreferences } from "@/features/recommendations/services/seat-preference-storage";
import { SeatPreferenceFields } from "@/features/recommendations/components/seat-preference-fields";
import { ScreenSeatMap } from "@/features/seats/components/screen-seat-map";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Armchair, ArrowLeft, ArrowRight, Check, ChevronDown, ShieldCheck, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoviePoster } from "@/features/movies/components/movie-poster";
import { getPreviewSeats, type HomeContent, type HomeShow } from "@/features/home/services/home-content-utils";
import { getShowAvailability } from "@/features/showtimes/services/showtime-discovery";
import { DEFAULT_SEAT_PREFERENCES, recommendSeats, type SeatPreferences } from "@/features/recommendations/services/recommend-seats";
import { movieTheatersRoute, showtimeSeatsRoute, bookingSuccessRoute } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);


export function ShowtimeSeatSelection({ content, show }: { content: HomeContent; show: HomeShow }) {
  const { user } = useAuth();
  const router = useRouter();
  const browserBookings = useMockBookings();
  const currentContent = useMemo(()=>applyConfirmedBookings(content,browserBookings.bookings),[content,browserBookings.bookings]);
  const storageReady = !browserBookings.loading && !browserBookings.error;
  const submittingRef = useRef(false);
  const requestRef = useRef<{signature:string;id:string}|null>(null);
  const [submitting,setSubmitting]=useState(false);
  const preferenceUserId = user?.id;
  const showtimeStrip = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(content.asOf);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(2);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<SeatPreferences>(DEFAULT_SEAT_PREFERENCES);
  const [message, setMessage] = useState("");
  useEffect(()=>{
    if(!preferenceUserId)return;
    let active=true;
    Promise.resolve().then(()=>{
      if(!active)return;
      try { const saved=loadSeatPreferences(preferenceUserId);setPreferences(saved.preferences);setQuantity(saved.quantity); }
      catch { setMessage("Saved preferences could not be loaded. You can adjust them here."); }
    });
    return ()=>{active=false;};
  },[preferenceUserId]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date().toISOString()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const at = new Date(clock);
  const availability = getShowAvailability(currentContent, show, at);
  const seats = getPreviewSeats(currentContent, show, at);
  const selected = seats.filter((seat) => selectedIds.includes(seat.id) && !seat.reserved && availability.status === "AVAILABLE");
  const total = selected.reduce((sum, seat) => sum + seat.price, 0);
  const recommendation = storageReady && availability.status === "AVAILABLE" ? recommendSeats(currentContent, show, quantity, preferences, at) : undefined;
  const unavailable = !storageReady || availability.status !== "AVAILABLE";
  const staleSelection = selectedIds.length !== selected.length;
  function toggleSeat(id: string) {
    if(submittingRef.current)return;
    setMessage("");
    const current = selected.map((seat) => seat.id);
    if (current.includes(id)) setSelectedIds(current.filter((value) => value !== id));
    else if (current.length < 6) setSelectedIds([...current, id]);
    else setMessage("You can choose up to 6 seats per booking.");
  }
  async function confirmBooking() {
    if(submittingRef.current)return;
    if(!user || !storageReady) {setMessage("Please log in and enable browser storage before confirming.");return;}
    submittingRef.current=true;setSubmitting(true);setMessage("");
    try {
      const signature=`${user.id}:${show.id}:${[...selectedIds].sort().join("|")}`;
      if(requestRef.current?.signature!==signature)requestRef.current={signature,id:crypto.randomUUID()};
      const booking=await confirmMockBooking({requestId:requestRef.current.id,showtimeId:show.id,seatIds:selectedIds});
      router.push(bookingSuccessRoute(booking.id));
    } catch(cause) {setMessage(cause instanceof Error?cause.message:"Unable to confirm booking. Please try again.");}
    finally {submittingRef.current=false;setSubmitting(false);}
  }
  const otherShows = content.shows.filter((item) => item.movie_id === show.movie_id && item.city === show.city && Date.parse(item.starts_at) > at.getTime()).sort((a,b) => Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const changeShow = movieTheatersRoute(show.movie_id, show.city);
  return <div className="pb-32">
    <Link href={changeShow} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><ArrowLeft className="size-4" aria-hidden="true" />Back to showtimes</Link>
    <nav aria-label="Booking progress" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 text-[10px] sm:text-xs">
      <ol className="flex flex-wrap items-center gap-3 sm:gap-5">{["Movie", "Showtime", "Seats", "Confirmation"].map((step, index) => <li key={step} aria-current={index === 2 ? "step" : undefined} className={cn("flex items-center gap-1.5", index === 2 ? "font-semibold text-primary" : "text-muted-foreground")}><span className={cn("flex size-5 items-center justify-center rounded-full", index < 2 ? "bg-tertiary/10 text-tertiary" : index === 2 ? "bg-primary text-white" : "bg-indigo-50")}>{index < 2 ? <Check className="size-3" aria-hidden="true" /> : index + 1}</span>{step}</li>)}</ol>
      <span className="flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-primary"><ShieldCheck className="size-3" aria-hidden="true" />Browser-only demo booking</span>
    </nav>
    <header className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50 p-4 sm:gap-4 sm:px-6">
      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded"><MoviePoster movie={show.movie} /></div>
      <div className="min-w-0 flex-1"><h1 className="text-sm font-semibold sm:text-lg">{show.movie.title}</h1><p className="mt-1 text-[11px] font-medium">{show.theater.name} · {show.screen.name}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(show.starts_at))} IST · {show.movie.language}</p></div>
      <label htmlFor="seat-quantity" className="flex w-full items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-white/80 px-3 py-2 text-xs font-medium sm:ml-auto sm:w-auto">Number of seats<select id="seat-quantity" value={quantity} disabled={submitting} onChange={(event) => { setQuantity(Number(event.target.value)); }} className="h-10 rounded-md border bg-background px-3">{[1, 2, 3, 4, 5, 6].map((value) => <option key={value}>{value}</option>)}</select></label>
      <nav aria-label="Switch showtime" className="w-full min-w-0 border-t border-indigo-100 pt-3">
        <p className="mb-2 text-[10px] font-medium text-muted-foreground">Showtimes in {show.city} · IST</p>
        <div className="flex min-w-0 items-center gap-2"><Button type="button" size="icon" variant="outline" className="shrink-0" aria-label="Previous showtimes" onClick={()=>showtimeStrip.current?.scrollBy({left:-showtimeStrip.current.clientWidth*0.8,behavior:"smooth"})}><ArrowLeft aria-hidden="true" /></Button><div ref={showtimeStrip} className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{otherShows.map((item) => {
          const status = getShowAvailability(currentContent, item, at).status;
          const current = item.id === show.id;
          const label = new Intl.DateTimeFormat("en-IN", {timeZone:"Asia/Kolkata",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}).format(new Date(item.starts_at));
          return <Button key={item.id} nativeButton={status!=="AVAILABLE"} render={status==="AVAILABLE" ? <Link href={showtimeSeatsRoute(item.id)} aria-current={current ? "page" : undefined} /> : undefined} disabled={status!=="AVAILABLE" || !storageReady} variant={current ? "default" : "outline"} aria-label={`${label} IST, ${item.theater.name}, ${item.screen.name}${current ? ", current show" : ""}`} className={cn("h-auto min-h-12 shrink-0 flex-col items-start gap-1 rounded-lg px-3 py-2 text-[10px]",current?"text-white":"bg-white")}><span className="font-semibold">{label}{current && " · Selected"}</span><span className={current?"text-white/80":"text-muted-foreground"}>{item.theater.name} · {item.screen.name}{status!=="AVAILABLE" ? status==="SOLD_OUT" ? " · Housefull" : " · Unavailable" : ""}</span></Button>;
        })}</div><Button type="button" size="icon" variant="outline" className="shrink-0" aria-label="Next showtimes" onClick={()=>showtimeStrip.current?.scrollBy({left:showtimeStrip.current.clientWidth*0.8,behavior:"smooth"})}><ArrowRight aria-hidden="true" /></Button></div>
      </nav>
    </header>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <section aria-labelledby="seat-map-heading" className="overflow-hidden rounded-2xl border border-border/40 bg-card p-4 sm:p-7">
          <h2 id="seat-map-heading" className="sr-only">Choose your seats</h2>
          <p className="mb-8 text-center text-[10px] text-muted-foreground">{show.screen.name} · {show.screen.capacity} seats · {show.screen.exit_positions.length} exits · {show.screen.speaker_positions.length} speakers</p>
          {unavailable && <p role="status" className="mb-5 rounded-lg bg-primary/5 p-4 text-sm">{availability.status === "SOLD_OUT" ? "This show is housefull." : "This show is unavailable."} <Link href={changeShow} className="text-primary underline">Choose another showtime</Link></p>}
          {recommendation && <p className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[10px]"><span className="rounded-full bg-tertiary px-2.5 py-1 font-semibold text-white">Recommended</span><span>Seats {recommendation.seats.map((seat) => seat.label).join(", ")}</span></p>}
          <ScreenSeatMap screen={show.screen} seats={seats} selectedIds={selected.map((seat)=>seat.id)} recommendedIds={recommendation?.seats.map((seat)=>seat.id) ?? []} unavailable={unavailable || submitting} onToggle={toggleSeat} />
          <ul aria-label="Seat legend" className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-3 border-t pt-5 text-[9px] text-muted-foreground">{[{ label: "Available", style: "bg-indigo-50" }, { label: "Selected", style: "bg-primary" }, { label: "Booked / held", style: "bg-slate-100" }, { label: "Premium", style: "bg-secondary/50" }, { label: "Recommended", style: "bg-tertiary" }].map((item) => <li key={item.label} className="flex items-center gap-1.5"><span className={cn("size-3 rounded-sm", item.style)} />{item.label}</li>)}<li className="flex items-center gap-1.5"><Volume2 className="size-3 text-violet-800" aria-hidden="true" />Speaker zone</li><li>A · Accessible</li></ul>
          <p className="mt-4 text-center text-[10px] text-muted-foreground">Select up to 6 seats. Swipe the seat map or use its arrow buttons to see all seats.</p>
        </section>

      </div>
      <aside className="space-y-5 lg:sticky lg:top-5" aria-label="Seat recommendations and booking summary">
        <section className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6"><h2 className="mt-2 text-lg font-semibold">Find Your Best Seats</h2><p className="mt-1 text-[10px] leading-5 text-muted-foreground">Adjust what matters to you. We suggest adjacent seats using this screen layout and seat data.</p>
          <Button type="button" variant="outline" aria-expanded={preferencesOpen} aria-controls="booking-preference-options" onClick={() => setPreferencesOpen(!preferencesOpen)} className="mt-4 h-11 w-full justify-between lg:hidden">Seat preferences<ChevronDown aria-hidden="true" className={cn("transition-transform", preferencesOpen && "rotate-180")} /></Button>
          <div id="booking-preference-options" className={cn("lg:block", preferencesOpen ? "block" : "hidden")}><fieldset disabled={submitting}><SeatPreferenceFields preferences={preferences} onChange={setPreferences} namePrefix="booking-preferences" /></fieldset></div>
          <div className="mt-4 rounded-xl border border-tertiary/15 bg-tertiary/5 p-4">{recommendation ? <><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-tertiary px-2 py-1 text-[9px] font-semibold text-white">{recommendation.score}/100 preference match</span><strong className="text-sm">{money(recommendation.seats.reduce((sum, seat) => sum + seat.price, 0))}</strong></div><h3 className="mt-3 text-sm font-semibold">Seats {recommendation.seats.map((seat) => seat.label).join(", ")}</h3><p className="mt-2 text-[10px] leading-5 text-muted-foreground">An available group in the same row, ranked using this screen layout, seat legroom, speaker balance, exit distance, and quieter-zone preferences. Scores are guidance, not a guarantee.</p><Button disabled={submitting} onClick={() => { setSelectedIds(recommendation.seats.map((seat) => seat.id)); setMessage("Recommended seats selected."); }} className="mt-3 min-h-10 w-full rounded-full text-[10px] text-white"><Armchair aria-hidden="true" />Select Recommended Seats</Button></> : <p className="text-xs leading-6">No available group of {quantity} adjacent seats. Try fewer seats or choose individually from the map.</p>}</div>
        </section>
        <section aria-labelledby="booking-summary-heading" className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><h2 id="booking-summary-heading" className="font-semibold">Summary</h2><span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px]">{selected.length} {selected.length === 1 ? "ticket" : "tickets"}</span></div>
          <div className="my-4 flex min-h-8 flex-wrap gap-2">{selected.length ? selected.map((seat) => <button type="button" key={seat.id} onClick={() => toggleSeat(seat.id)} aria-label={`Remove seat ${seat.label}`} className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2 py-1 text-[10px] text-primary focus-visible:outline-ring">{seat.label} · {money(seat.price)}<X className="size-3" aria-hidden="true" /></button>) : <p className="text-xs text-muted-foreground">Choose seats on the map to get started.</p>}</div>
          <dl className="space-y-2 text-[11px]"><div className="flex justify-between"><dt>Tickets ({selected.length})</dt><dd>{money(total)}</dd></div><div className="flex items-end justify-between border-t pt-4"><dt className="font-semibold">Total payable<span className="mt-1 block text-[9px] font-normal text-muted-foreground">Prices from the selected show inventory</span></dt><dd className="text-xl font-semibold text-primary" aria-live="polite">{money(total)}</dd></div></dl>


        </section>
      </aside>
    </div>
    <section aria-label="Confirm your booking" className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(0_0_0/0.06)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{selected.length} {selected.length === 1 ? "seat" : "seats"} selected</p><p className="text-lg font-semibold text-primary sm:text-xl" aria-live="polite">{money(total)}</p></div>
          <Button disabled={!selected.length || staleSelection || unavailable || submitting} onClick={confirmBooking} className="h-12 shrink-0 rounded-xl px-5 text-xs text-white sm:min-w-60 sm:text-sm">{submitting ? "Confirming…" : "Confirm Booking"}<ArrowRight aria-hidden="true" /></Button>
        </div>
        {browserBookings.loading && <p role="status" className="mt-2 text-xs">Loading browser bookings…</p>}
        {browserBookings.error && <p role="alert" className="mt-2 text-xs leading-5 text-destructive">{browserBookings.error}</p>}
        {(message || staleSelection) && <p role="status" className="mt-2 text-xs leading-5 text-primary">{message || "Seat availability changed. Please review your selection."}</p>}
      </div>
    </section>
  </div>;
}
