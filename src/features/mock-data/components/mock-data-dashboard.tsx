"use client";
import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { Database, Download, Plus, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/features/mock-data/components/mock-data-provider";
import { TABLES, type MockDatabase, type MockTable } from "@/features/mock-data/types/mock-database";
import { bookingDraft, deleteMockRecord, newMockRecord, recordTemplate, saveMockRecord } from "@/features/mock-data/services/mock-data-editor";
import { downloadMockData, parseMockDataFile, replaceMockDatabase, resetMockDatabase } from "@/features/mock-data/services/mock-data-store";
import { object } from "@/features/mock-data/services/mock-data-validation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const names: Record<MockTable,string> = { movies:"Movies", theaters:"Theaters", screens:"Screens", showtimes:"Showtimes", seats:"Seats", bookings:"Bookings", users:"Mock Users" };
const columns: Record<MockTable,string[]> = {
  movies:["id","title","language","genre","duration_minutes","is_active"], theaters:["id","name","location"], screens:["id","name","theater_id","capacity","row_count","col_count"],
  showtimes:["id","movie_id","screen_id","starts_at","base_price","is_active"], seats:["id","screen_id","row_label","seat_number","seat_type"],
  bookings:["booking_number","user_id","showtime_id","seat_ids","total_amount","status"], users:["id","name","email"],
};
const fieldClass = "min-h-11 w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";
function rowObject(value: unknown): Record<string, unknown> { if (!object(value)) throw new Error("Invalid table record."); return value; }
function cell(value: unknown): string { return Array.isArray(value) ? value.join(", ") : String(value); }
const caption = (key:string) => key.replaceAll("_"," ");
type Confirmation = { title:string; message:string; action:()=>Promise<void> };

export function MockDataDashboard() {
  const { data, loading, error } = useMockData();
  const [table,setTable] = useState<MockTable>("movies");
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("");
  const [page,setPage] = useState(0);
  const [feedback,setFeedback] = useState({error:false,text:""});
  const [pending,setPending] = useState(false);
  const [editing,setEditing] = useState<{ initial:Record<string,unknown>; original:unknown } | null>(null);
  const [confirmation,setConfirmation] = useState<Confirmation|null>(null);
  const file = useRef<HTMLInputElement>(null);
  const records = data ? data[table].map(rowObject) : [];
  const filterKey = table === "bookings" ? "status" : table === "seats" || table === "showtimes" ? "screen_id" : table === "screens" ? "theater_id" : table === "movies" ? "language" : "";
  const rows = records.filter(row => object(row) && (!filter || String(row[filterKey]) === filter) && JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1,Math.ceil(rows.length/20));
  const currentPage = Math.min(page,pages-1);
  async function perform(action:()=>Promise<void>, success:string) {
    setPending(true); setFeedback({error:false,text:""});
    try { await action(); setFeedback({error:false,text:success}); setConfirmation(null); }
    catch (cause) { setFeedback({error:true,text:cause instanceof Error ? cause.message : "Action failed. Your data was not changed."}); }
    finally { setPending(false); }
  }
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Database className="size-4" aria-hidden="true" />Evaluator tools</p><h1 className="text-2xl font-semibold sm:text-3xl">Mock Data Management</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Demo only. Changes affect this browser’s mock data only. No backend, payment gateway, or production admin security.</p></div><Link href={ROUTES.home} className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-sm hover:underline">Open customer site</Link></div>
    <div className="my-6 flex flex-wrap gap-2">
      <Button variant="outline" disabled={!data || pending} onClick={()=>{try {downloadMockData();} catch(cause) {setFeedback({error:true,text:String(cause)});}}}><Download aria-hidden="true" />Export JSON</Button>
      <Button variant="outline" disabled={pending} onClick={()=>file.current?.click()}><Upload aria-hidden="true" />Import JSON</Button>
      <Button variant="outline" disabled={pending} onClick={()=>setConfirmation({title:"Reset to Default Data?",message:"This replaces all evaluator changes and browser bookings with the original seed catalog and bookings. Mock login accounts and preferences are kept. Export JSON first if you need a backup.",action:resetMockDatabase})}><RotateCcw aria-hidden="true" />Reset to Default Data</Button>
      {error && <Button variant="outline" onClick={()=>downloadMockData(true)}>Export recovery data</Button>}
      <input ref={file} type="file" accept="application/json,.json" className="sr-only" aria-label="Import mock database JSON" onChange={async event=>{
        const selected=event.target.files?.[0]; event.target.value=""; if(!selected)return;
        try { if(selected.size>5*1024*1024)throw new Error("Import must be smaller than 5 MB."); const imported=parseMockDataFile(await selected.text()); setConfirmation({title:"Replace mock database?",message:`Import ${TABLES.reduce((count,key)=>count+imported[key].length,0)} records? This replaces all current evaluator data and bookings in this browser. Export a backup first.`,action:()=>replaceMockDatabase(imported)}); }
        catch(cause){setFeedback({error:true,text:cause instanceof Error?cause.message:"Unable to import JSON."});}
      }} />
    </div>
    {(feedback.text || error) && <p role={feedback.error || error ? "alert" : "status"} className={cn("mb-5 rounded-xl border p-4 text-sm leading-6", feedback.error || error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-tertiary/30 bg-tertiary/5 text-tertiary")}>{feedback.text || error}</p>}
    {loading && <p role="status">Loading this browser’s data…</p>}
    {data && <>
      <nav aria-label="Mock data tables" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{TABLES.map(key=><Button key={key} variant={table===key?"default":"outline"} className={table===key?"text-white":"bg-card"} aria-pressed={table===key} onClick={()=>{setTable(key);setSearch("");setFilter("");setPage(0);}}>{names[key]} <span className="text-[10px] opacity-75">{data[key].length}</span></Button>)}</nav>
      <section aria-labelledby="mock-table-title" className="mt-5 min-w-0 rounded-xl border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="mock-table-title" className="text-xl font-semibold">{names[table]}</h2><Button disabled={pending} onClick={()=>setEditing({initial:newMockRecord(table,data),original:null})} className="text-white"><Plus aria-hidden="true" />Add record</Button></div>
        <p className="mb-4 text-xs leading-6 text-muted-foreground">{table === "users" ? "Reference profiles only. Editing these does not create login credentials or change mock authentication. Customer bookings register their existing Auth user ID here automatically." : table === "screens" ? "Dimensions and layout points are editable. Capacity follows physical seat records; add or remove seats in the Seats tab." : table === "bookings" ? "Only CONFIRMED bookings reserve seats. CANCELLED, EXPIRED and PENDING_PAYMENT do not. Prices and display details are snapshots derived from the selected showtime; no payment is created." : "References use stable IDs. Referenced records cannot be deleted until their dependents have been removed. Dates and times use ISO strings with a timezone."}</p>
        <div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Search all fields<input className={`${fieldClass} mt-1`} type="search" value={search} onChange={event=>{setSearch(event.target.value);setPage(0);}} placeholder={`Search ${names[table].toLowerCase()}…`} /></label>{filterKey && <label className="text-xs font-medium">Filter by {caption(filterKey)}<select className={`${fieldClass} mt-1`} value={filter} onChange={event=>{setFilter(event.target.value);setPage(0);}}><option value="">All</option>{[...new Set(records.flatMap(row=>object(row)?[String(row[filterKey])]:[]))].sort().map(value=><option key={value}>{value}</option>)}</select></label>}</div>
        <p role="status" className="mb-3 text-xs text-muted-foreground">{rows.length} matching records · page {currentPage+1} of {pages}. Swipe the table to see all columns.</p>
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-lg border focus-visible:outline-2 focus-visible:outline-ring" tabIndex={0} role="region" aria-label={`${names[table]} records`}><table className="w-full text-left text-xs"><caption className="sr-only">Editable {names[table]} records</caption><thead className="bg-muted"><tr>{columns[table].map(key=><th key={key} scope="col" className="whitespace-nowrap p-3 capitalize">{caption(key)}</th>)}<th scope="col" className="p-3">Actions</th></tr></thead><tbody>{rows.slice(currentPage*20,currentPage*20+20).map(row=>object(row)&&<tr key={String(row.id)} className="border-t align-top">{columns[table].map(key=><td key={key} className="min-w-28 max-w-64 break-words p-3">{cell(row[key])}</td>)}<td className="p-2"><div className="flex gap-1"><Button variant="outline" size="sm" onClick={()=>setEditing({initial:table==="bookings"?bookingDraft(data.bookings.find(item=>item.id===row.id)!):{...row},original:row})}>Edit</Button><Button variant="destructive" size="sm" onClick={()=>setConfirmation({title:"Delete record?",message:`Delete ${row.id}? This cannot be undone without a backup or reset. Referenced records are blocked; deleting a booking releases its seats.`,action:()=>deleteMockRecord(table,String(row.id),row)})}>Delete</Button></div></td></tr>)}</tbody></table></div>
        {!rows.length && <p className="py-8 text-center text-sm">No records found.</p>}
        <div className="mt-4 flex items-center justify-between gap-3"><Button variant="outline" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</Button><span className="text-xs">{currentPage+1} / {pages}</span><Button variant="outline" disabled={currentPage+1===pages} onClick={()=>setPage(currentPage+1)}>Next</Button></div>
      </section>
      {editing && <RecordEditor key={`${table}-${String(editing.initial.id)}`} table={table} data={data} initial={editing.initial} original={editing.original} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);setFeedback({error:false,text:"Record saved. Customer pages now use the updated data."});}} />}
    </>}
    {confirmation && <Dialog.Root open onOpenChange={open=>{if(!open&&!pending)setConfirmation(null);}}><Dialog.Portal><Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral/60" /><Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-5 shadow-xl"><Dialog.Title className="text-lg font-semibold">{confirmation.title}</Dialog.Title><Dialog.Description className="my-4 text-sm leading-6 text-muted-foreground">{confirmation.message}</Dialog.Description>{feedback.error&&<p role="alert" className="mb-4 text-sm text-destructive">{feedback.text}</p>}<div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={pending} onClick={()=>setConfirmation(null)}>Cancel</Button><Button disabled={pending} className="text-white" onClick={()=>perform(confirmation.action,"Mock data updated successfully.")}>{pending?"Applying…":"Confirm"}</Button></div></Dialog.Popup></Dialog.Portal></Dialog.Root>}
  </>;
}

function RecordEditor({table,data,initial,original,onClose,onSaved}:{table:MockTable;data:MockDatabase;initial:Record<string,unknown>;original:unknown;onClose():void;onSaved():void}) {
  const [draft,setDraft]=useState<Record<string,string>>(()=>Object.fromEntries(Object.entries(initial).map(([key,value])=>[key,typeof value==="object"?JSON.stringify(value,null,2):String(value)])));
  const [error,setError]=useState(""); const [pending,setPending]=useState(false);
  const template=recordTemplate(table);
  const references:Record<string,readonly {id:string;label:string}[]>={
    movie_id:data.movies.map(item=>({id:item.id,label:item.title})), theater_id:data.theaters.map(item=>({id:item.id,label:item.name})),
    screen_id:data.screens.map(item=>({id:item.id,label:`${item.theater_id} · ${item.name}`})), user_id:data.users.map(item=>({id:item.id,label:`${item.name} · ${item.email}`})),
    showtime_id:data.showtimes.map(item=>({id:item.id,label:`${item.movie_id} · ${item.screen_id} · ${item.starts_at}`})),
  };
  const enums:Record<string,string[]>={status:["CONFIRMED","CANCELLED","PENDING_PAYMENT","EXPIRED"],seat_type:["STANDARD","PREMIUM","RECLINER","ACCESSIBLE"],default_seat_type:["STANDARD","PREMIUM","RECLINER","ACCESSIBLE"]};
  const set=(key:string,value:string)=>setDraft(current=>({...current,[key]:value,...(key==="showtime_id"?{seat_ids:"[]"}:{})}));
  return <Dialog.Root open onOpenChange={open=>{if(!open&&!pending)onClose();}}><Dialog.Portal><Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral/60" /><Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-card shadow-xl">
    <header className="relative shrink-0 border-b p-5 pr-14"><Dialog.Title className="text-xl font-semibold">{original?"Edit":"Create"} {names[table]} record</Dialog.Title><Dialog.Description className="mt-2 text-xs leading-5 text-muted-foreground">Stable IDs connect records. Required fields and references are validated before anything is saved.</Dialog.Description><Dialog.Close disabled={pending} aria-label="Close record editor" className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-2"><X className="size-4" aria-hidden="true" /></Dialog.Close></header>
    <form className="flex min-h-0 flex-col" onSubmit={async event=>{event.preventDefault();setPending(true);setError("");try {
      const parsed:Record<string,unknown>={}; for(const [key,sample] of Object.entries(template)){const text=draft[key]??"";parsed[key]=typeof sample==="boolean"?text==="true":typeof sample==="number"?(text.trim()?Number(text):NaN):typeof sample==="object"?JSON.parse(text):text;}
      await saveMockRecord(table,parsed,original);onSaved();
    }catch(cause){setError(cause instanceof Error?cause.message:"Unable to save record.");}finally{setPending(false);}}}>
      <fieldset disabled={pending} className="min-h-0 overflow-y-auto overscroll-contain p-5"><div className="grid min-w-0 gap-4 sm:grid-cols-2">{Object.entries(template).map(([key,sample])=><label key={key} className={cn("min-w-0 text-xs font-medium capitalize",typeof sample==="object"&&"sm:col-span-2")}>{caption(key)}{key==="capacity"&&<span className="ml-1 font-normal normal-case text-muted-foreground">(calculated from seats)</span>}{references[key]?<select aria-label={caption(key)} required className={`${fieldClass} mt-1`} value={draft[key]} onChange={event=>set(key,event.target.value)}><option value="">Choose a record</option>{references[key].map(item=><option key={item.id} value={item.id}>{item.id} · {item.label}</option>)}</select>:enums[key]||typeof sample==="boolean"?<select aria-label={caption(key)} className={`${fieldClass} mt-1`} value={draft[key]} onChange={event=>set(key,event.target.value)}>{(enums[key]??["true","false"]).map(value=><option key={value}>{value}</option>)}</select>:<>{typeof sample==="object"?<textarea aria-label={caption(key)} required rows={4} className={`${fieldClass} mt-1 font-mono text-xs normal-case`} value={draft[key]} onChange={event=>set(key,event.target.value)} aria-describedby={`help-${key}`} />:<input aria-label={caption(key)} required={key!=="description"} readOnly={(key==="id"&&!!original)||key==="capacity"} type={typeof sample==="number"?"number":key==="email"?"email":"text"} min={typeof sample==="number"?0:undefined} step="any" className={`${fieldClass} mt-1 read-only:bg-muted`} value={draft[key]} onChange={event=>set(key,event.target.value)} />}{typeof sample==="object"&&<span id={`help-${key}`} className="mt-1 block text-[11px] font-normal normal-case text-muted-foreground">Enter valid JSON. {key==="seat_ids"?"Choose 1–6 distinct seat IDs from this showtime's screen below.":"Coordinates are zero-based. Preserve the displayed object field names."}</span>}</> }</label>)}</div>
      {table==="bookings"&&<div className="mt-4"><p className="mb-2 text-xs font-medium">Seat IDs for selected showtime</p><div className="max-h-40 overflow-y-auto rounded-lg border p-3 text-xs leading-6">{data.seats.filter(seat=>seat.screen_id===data.showtimes.find(show=>show.id===draft.showtime_id)?.screen_id).map(seat=><button type="button" key={seat.id} className="m-1 min-h-11 rounded-lg border px-2 hover:bg-muted focus-visible:outline-2" onClick={()=>{try {const chosen:unknown=JSON.parse(draft.seat_ids);if(!Array.isArray(chosen)||!chosen.every(item=>typeof item==="string"))throw new Error();set("seat_ids",JSON.stringify(chosen.includes(seat.id)?chosen.filter(id=>id!==seat.id):[...chosen,seat.id],null,2));}catch{setError("Enter a valid seat ID array first.");}}}>{seat.id}</button>)}</div></div>}
      </fieldset>
      <footer className="shrink-0 border-t p-4">{error&&<p role="alert" className="mb-3 max-h-28 overflow-y-auto text-xs leading-5 text-destructive">{error}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={pending} onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending} className="text-white">{pending?"Saving…":"Save record"}</Button></div></footer>
    </form>
  </Dialog.Popup></Dialog.Portal></Dialog.Root>;
}
