"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Bike, Car, CarFront, Motorbike, Van } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SeatCountVehicle({ quantity }: { quantity: number }) {
  const iconClassName = "h-20 w-28 text-primary";
  switch (quantity) {
    case 1: return <Bike className={iconClassName} strokeWidth={1.25} />;
    case 2: return <Motorbike className={iconClassName} strokeWidth={1.25} />;
    case 3: return <svg viewBox="0 0 120 80" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 55V26h45l15 29M15 26h52l-5-8H23z" fill="var(--secondary)" />
      <path d="M19 55h64l9-15h9l8 21H19z" fill="var(--tertiary)" />
      <path d="M48 29v23m18-23 9 23M91 40l-6-12h-8M24 33h17v15H24z" />
      <circle cx="34" cy="62" r="9" fill="var(--card)" />
      <circle cx="96" cy="62" r="9" fill="var(--card)" />
    </svg>;
    case 4: return <Car className={iconClassName} strokeWidth={1.25} />;
    case 5: return <CarFront className="h-24 w-32 text-primary" strokeWidth={1.25} />;
    default: return <Van className={iconClassName} strokeWidth={1.25} />;
  }
}

export function SeatCountModal({ open, quantity, onQuantityChange, onContinue }: {
  open: boolean;
  quantity: number;
  onQuantityChange(quantity: number): void;
  onContinue(): void;
}) {
  return <Dialog.Root open={open} disablePointerDismissal onOpenChange={(nextOpen) => { if (!nextOpen) onContinue(); }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-neutral/65" />
      <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card px-5 py-6 text-center shadow-2xl focus:outline-none sm:px-10">
        <Dialog.Title className="text-lg font-semibold">How many seats?</Dialog.Title>
        <div className="flex h-28 flex-col items-center justify-center sm:h-32">
          <div aria-hidden="true"><SeatCountVehicle quantity={quantity} /></div>
        </div>
        <fieldset>
          <legend className="sr-only">Number of seats</legend>
          <div className="flex justify-center gap-1 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((count) => <label key={count} className="relative cursor-pointer">
              <input type="radio" name="initial-seat-count" value={count} checked={quantity === count} onChange={() => onQuantityChange(count)} className="peer sr-only" />
              <span className={cn("flex size-11 items-center justify-center rounded-full text-base transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring", quantity === count ? "bg-primary text-white" : "hover:bg-primary/10")}>{count}</span>
            </label>)}
          </div>
        </fieldset>
        <Dialog.Description className="mt-4 text-xs text-muted-foreground">Choose up to 6 seats per booking.</Dialog.Description>
        <Button onClick={onContinue} className="mt-6 h-11 w-full text-white">Select {quantity} {quantity === 1 ? "seat" : "seats"}</Button>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}

