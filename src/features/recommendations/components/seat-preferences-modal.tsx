"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Armchair, Check, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeatPreferenceFields } from "@/features/recommendations/components/seat-preference-fields";
import { DEFAULT_SAVED_SEAT_PREFERENCES, loadSeatPreferences, saveSeatPreferences } from "@/features/recommendations/services/seat-preference-storage";

export function SeatPreferencesModal({ userId, onClose }: { userId: string; onClose(): void }) {
  const [value, setValue] = useState(DEFAULT_SAVED_SEAT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try { setValue(loadSeatPreferences(userId)); }
      catch { setError("Your browser could not load saved preferences. You can try saving again."); }
      finally { setLoading(false); }
    });
    return () => { active = false; };
  }, [userId]);

  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-neutral/50 backdrop-blur-sm" />
      <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl focus:outline-none">
        <header className="relative shrink-0 border-b px-5 py-5 sm:px-6">
          <Dialog.Close aria-label="Close seat preferences" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><X className="size-4" aria-hidden="true" /></Dialog.Close>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Armchair className="size-5" aria-hidden="true" /></div>
          <Dialog.Title className="pr-6 text-xl font-semibold tracking-tight">Make every seat your seat</Dialog.Title>
          <Dialog.Description className="mt-1.5 text-xs leading-5 text-muted-foreground">Choose what matters most. We’ll use this to suggest seats for you.</Dialog.Description>
        </header>
        <form className="flex min-h-0 flex-col" onSubmit={(event) => {
          event.preventDefault();
          try { saveSeatPreferences(userId, value); onClose(); }
          catch { setError("Could not save preferences in this browser. Please allow local storage and try again."); }
        }}>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <fieldset disabled={loading} className="min-w-0">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
                <div><p id="preferred-seat-count-label" className="text-xs font-medium">How many seats?</p><p className="mt-1 text-[11px] text-muted-foreground">Your usual group size</p></div>
                <div role="group" aria-labelledby="preferred-seat-count-label" className="flex items-center gap-1 rounded-lg border bg-background p-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Fewer seats" disabled={value.quantity <= 1} onClick={() => setValue({ ...value, quantity: value.quantity - 1 })}><Minus aria-hidden="true" /></Button>
                  <output aria-live="polite" className="w-6 text-center text-sm font-semibold">{value.quantity}</output>
                  <Button type="button" variant="ghost" size="icon" aria-label="More seats" disabled={value.quantity >= 6} onClick={() => setValue({ ...value, quantity: value.quantity + 1 })}><Plus aria-hidden="true" /></Button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between"><p className="text-xs font-semibold">Your priorities</p><span className="text-[10px] text-muted-foreground">Low → High importance</span></div>
              <SeatPreferenceFields preferences={value.preferences} onChange={(preferences) => setValue({ ...value, preferences })} namePrefix="saved-preferences" />
              <p className="text-[11px] leading-5 text-muted-foreground">Saved for your account in this browser. Change these anytime when choosing seats.</p>
            </fieldset>
            {error && <p role="alert" className="mt-3 text-xs leading-5 text-destructive">{error}</p>}
          </div>
          <footer className="flex shrink-0 items-center gap-3 border-t bg-card px-5 py-4 sm:px-6">
            <Button type="button" variant="ghost" className="h-11 px-3 text-muted-foreground" onClick={onClose}>Maybe later</Button>
            <Button type="submit" disabled={loading} className="h-11 flex-1 text-white"><Check aria-hidden="true" />{loading ? "Loading…" : "Save preferences"}</Button>
          </footer>
        </form>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
