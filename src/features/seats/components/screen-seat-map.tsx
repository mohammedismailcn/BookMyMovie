"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, DoorOpen, Volume2 } from "lucide-react";
import type { PreviewSeat, HomeShow } from "@/features/home/services/home-content-service";
import { cn } from "@/lib/utils";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
function screenLabel(index: number): string {
  let label = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) label = String.fromCharCode(65 + (value - 1) % 26) + label;
  return label;
}

export function ScreenSeatMap({ screen, seats, selectedIds, recommendedIds, unavailable, onToggle }: {
  screen: HomeShow["screen"]; seats: readonly PreviewSeat[]; selectedIds: readonly string[];
  recommendedIds: readonly string[]; unavailable: boolean; onToggle(id: string): void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const stage = <div className="col-span-full my-6 px-8"><div className="h-3 rounded-t-[100%] border-t-[3px] border-primary/35 bg-primary/5" /><p className="mt-1 text-center text-[9px] uppercase tracking-widest text-primary">Screen this way</p></div>;
  return <div className="min-w-0 [--seat-size:2.75rem] sm:[--seat-size:2rem]"><div className="mb-3 flex items-center justify-between gap-3"><Button type="button" variant="outline" size="icon" aria-label="View seats to the left" onClick={() => mapRef.current?.scrollBy({left: -200, behavior: "smooth"})}><ArrowLeft aria-hidden="true" /></Button><span className="text-[10px] text-muted-foreground">Swipe to explore seats</span><Button type="button" variant="outline" size="icon" aria-label="View seats to the right" onClick={() => mapRef.current?.scrollBy({left: 200, behavior: "smooth"})}><ArrowRight aria-hidden="true" /></Button></div><div ref={mapRef} role="group" aria-label="Auditorium seats" tabIndex={0} className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-ring"><div className="mx-auto grid w-max items-start gap-x-1.5 gap-y-2.5 sm:gap-x-2" style={{ gridTemplateColumns: `1rem repeat(${screen.col_count}, var(--seat-size)) 1rem` }}>
    {Array.from({length:screen.row_count},(_,rowIndex) => {
      const rowSeats=seats.filter((seat)=>seat.rowIndex===rowIndex);
      const row=rowSeats[0]?.row ?? screenLabel(rowIndex);
      const exits=screen.exit_positions.filter((exit)=>exit.row_index===rowIndex);
      const legroom=screen.extra_legroom_after_rows.includes(rowIndex-1);
      const previousSeats=seats.filter((seat)=>seat.rowIndex===rowIndex-1);
      const sectionKey=(items: readonly PreviewSeat[])=>[...new Set(items.map((seat)=>`${seat.type}:${seat.price}`))].sort().join("|");
      const startsSection=rowIndex===0 || sectionKey(rowSeats)!==sectionKey(previousSeats);
      const prices=[...new Set(rowSeats.map((seat)=>seat.price))];
      const types=[...new Set(rowSeats.map((seat)=>seat.type.toLowerCase()))].join(" / ");
      return <div key={rowIndex} className="contents">
        {screen.screen_row_index===rowIndex && stage}
        {legroom && <p className="col-span-full mt-3 rounded bg-tertiary/5 px-2 py-1 text-[9px] text-tertiary">Extra space after row {seats.find((seat)=>seat.rowIndex===rowIndex-1)?.row ?? screenLabel(rowIndex-1)}</p>}
        {startsSection && <p className="col-span-full mt-2 text-[9px] capitalize text-muted-foreground">{types || "No seats configured"}{prices.length>0 ? ` · ${prices.length>1 ? "from " : ""}${money(Math.min(...prices))}` : ""}</p>}
        <span className="self-center text-[10px] text-muted-foreground">{row}</span>
        {Array.from({length:screen.col_count},(_,columnIndex)=>{
          const seat=rowSeats.find((item)=>item.columnIndex===columnIndex);
          const speakers=screen.speaker_positions.filter((speaker)=>speaker.row_index===rowIndex && speaker.column_index===columnIndex).map((speaker)=>speaker.name).join(", ");
          const chosen=seat && selectedIds.includes(seat.id);
          const recommended=seat && recommendedIds.includes(seat.id);
          return <span key={columnIndex} className="relative isolate size-11 sm:size-8">{speakers && <span title={speakers} className="pointer-events-none absolute -inset-x-1 -bottom-2.5 -top-1 -z-10 rounded-lg bg-violet-100"><Volume2 aria-hidden="true" className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 text-violet-800" /><span className="sr-only">Speaker: {speakers}, row {row}, column {columnIndex+1}</span></span>}{seat ? <button type="button" disabled={unavailable || seat.reserved} aria-pressed={Boolean(chosen)} title={speakers || undefined} aria-label={`Seat ${seat.label}, ${seat.reserved ? seat.status.toLowerCase() : seat.type.toLowerCase()}, ${money(seat.price)}${speakers ? `, speaker zone: ${speakers}` : ""}${recommended ? ", recommended" : ""}`} onClick={()=>onToggle(seat.id)} className={cn("relative flex size-11 sm:size-8 items-center justify-center rounded-md text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",unavailable||seat.reserved?"cursor-not-allowed bg-slate-100 text-slate-300 line-through":chosen?"bg-primary text-white hover:bg-primary/85":recommended?"bg-tertiary text-white hover:bg-tertiary/85":seat.vip?"bg-secondary/45 text-amber-900 hover:bg-secondary/70":"bg-indigo-50 text-indigo-900 hover:bg-indigo-100",chosen&&"ring-2 ring-neutral ring-offset-2")}>{recommended&&!chosen&&!seat.reserved&&<span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1 text-center text-[5px] font-semibold leading-none">Recommended</span>}{chosen?<Check className="size-3" aria-hidden="true" />:seat.number}{seat.type==="ACCESSIBLE"&&<span className="absolute -bottom-1 right-0 rounded bg-white px-0.5 text-[7px] text-indigo-800" aria-hidden="true">A</span>}</button>:<span className="sr-only">No seat at row {row}, column {columnIndex+1}</span>}</span>;
        })}
        <span className="self-center text-right text-[10px] text-muted-foreground" aria-hidden="true">{row}</span>
        {exits.length>0&&<div className="col-span-full grid gap-x-1.5 sm:gap-x-2" style={{gridTemplateColumns:`1rem repeat(${screen.col_count}, var(--seat-size)) 1rem`}} aria-label={`Exits at row ${row}`}>{exits.map((exit,index)=><span key={index} style={{gridColumn:exit.column_index+2}} title={`${exit.name}: row ${row}, column ${exit.column_index+1}`} className="flex flex-col items-center rounded bg-tertiary/10 py-1 text-center text-[8px] leading-3 text-tertiary"><DoorOpen className="size-3" aria-hidden="true" />{exit.name}<span className="sr-only">Row {row}, column {exit.column_index+1}</span></span>)}</div>}
      </div>;
    })}
    {screen.screen_row_index>=screen.row_count && stage}
  </div></div></div>;
}
