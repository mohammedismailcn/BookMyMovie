"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, MapPin, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScreeningDate = { value: string; weekday: string; label: string };
const fieldClass = "w-full min-w-0 border-0 bg-transparent text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function ScreeningFilters({ cities, dates, city, date, query, onCityChange, onDateChange, onQueryChange, onSubmit }: {
  cities: readonly string[]; dates: readonly ScreeningDate[]; city: string; date: string; query: string;
  onCityChange(value: string): void; onDateChange(value: string): void; onQueryChange(value: string): void; onSubmit(): void;
}) {
  const dateStrip=useRef<HTMLDivElement>(null);
  const selectedLabel=useRef<HTMLLabelElement>(null);
  useEffect(()=>{
    const strip=dateStrip.current;
    const label=selectedLabel.current;
    if(strip&&label) strip.scrollTo({left:Math.max(0,label.offsetLeft-strip.clientWidth/2+label.clientWidth/2)});
  },[date]);
  return <section aria-label="Find a screening" className="mt-3 min-w-0 rounded-xl border border-border/50 bg-card p-4 shadow-lg shadow-slate-900/5 sm:p-5">
    <form onSubmit={(event)=>{event.preventDefault();onSubmit();}} className="grid min-w-0 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.5fr_auto]">
      <div className="rounded-lg bg-indigo-50/80 px-3 py-2.5"><label htmlFor="auditorium-hub" className="mb-1.5 block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Auditorium hub</label><div className="flex items-center gap-1.5"><MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" /><select id="auditorium-hub" value={city} onChange={(event)=>onCityChange(event.target.value)} className={cn(fieldClass,"appearance-none")} >{cities.map((value)=><option key={value}>{value}</option>)}</select><ChevronDown className="size-3 shrink-0" aria-hidden="true" /></div></div>
      <div className="rounded-lg bg-indigo-50/80 px-3 py-2.5"><label htmlFor="movie-search" className="mb-1.5 block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Explore movies</label><div className="flex items-center gap-2"><Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /><input id="movie-search" type="search" value={query} onChange={(event)=>onQueryChange(event.target.value)} placeholder="Search title, language, genre…" className={fieldClass} /></div></div>
      <fieldset className="min-w-0"><legend className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Screening date</legend><div className="flex min-w-0 items-center gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Previous screening dates" className="size-8 shrink-0" onClick={()=>dateStrip.current?.scrollBy({left:-dateStrip.current.clientWidth*0.8,behavior:"smooth"})}><ArrowLeft className="size-3.5" aria-hidden="true" /></Button><div ref={dateStrip} className="relative flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{dates.map((day)=><label key={day.value} ref={date===day.value ? selectedLabel : undefined} className={cn("relative flex min-h-11 min-w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg px-2 py-1 text-center text-[10px] font-semibold has-focus-visible:ring-2 has-focus-visible:ring-ring",date===day.value?"bg-primary text-white":"bg-indigo-50 hover:bg-indigo-100")}><input type="radio" name="date" value={day.value} checked={date===day.value} onChange={()=>onDateChange(day.value)} className="sr-only" /><span>{day.weekday}</span><span>{day.label}</span></label>)}</div><Button type="button" size="icon" variant="ghost" aria-label="Next screening dates" className="size-8 shrink-0" onClick={()=>dateStrip.current?.scrollBy({left:dateStrip.current.clientWidth*0.8,behavior:"smooth"})}><ArrowRight className="size-3.5" aria-hidden="true" /></Button></div></fieldset>
      <Button type="submit" className="h-11 rounded-lg px-6 text-white"><Ticket aria-hidden="true" />Find Shows</Button>
      {!dates.length&&<p className="text-xs text-muted-foreground">No upcoming shows are scheduled for this city.</p>}
    </form>
  </section>;
}
