"use client";
import type { SeatPreferences } from "@/features/recommendations/services/recommend-seats";
import { cn } from "@/lib/utils";
const fields: { key: keyof SeatPreferences; label: string }[] = [
  { key: "view", label: "Best center view" }, { key: "legroom", label: "Extra legroom" },
  { key: "sound", label: "Balanced sound" }, { key: "exit", label: "Quick exit" }, { key: "quiet", label: "Quiet zone" },
];
export function SeatPreferenceFields({ preferences, onChange, namePrefix }: { preferences: SeatPreferences; onChange(value: SeatPreferences): void; namePrefix: string }) {
  return <div className="my-4 space-y-3">{fields.map(({key,label})=><fieldset key={key} className="flex flex-wrap items-center justify-between gap-2"><legend className="float-left text-xs">{label}</legend><div className="flex gap-1 rounded-full bg-indigo-50 p-0.5">{["Low","Med","High"].map((level,index)=><label key={level} className={cn("relative cursor-pointer rounded-full flex min-h-11 min-w-11 items-center justify-center px-2 py-2 text-[11px] sm:min-h-0 has-focus-visible:ring-2 has-focus-visible:ring-ring",preferences[key]===index+1?"bg-primary text-white":"text-muted-foreground")}><input type="radio" name={`${namePrefix}-${key}`} value={index+1} checked={preferences[key]===index+1} onChange={()=>onChange({...preferences,[key]:index+1})} className="sr-only" />{level}</label>)}</div></fieldset>)}</div>;
}
