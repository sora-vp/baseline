"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode as QRIcon } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@sora-vp/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sora-vp/ui/dialog";
import { Input } from "@sora-vp/ui/input";

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (fn: never) => void;
/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delay The delay (in ms) for the function to return
 * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
 */

export function useDebounce<Func extends SomeFunction>(
  func: Func,
  delay = 1000,
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const timer = useRef<Timer>(null!);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Func;

  return debouncedFunction;
}

export function SuddenQr() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const [isOpen, setDialogOpen] = useState(false);
  const [qrInput, setQrInput] = useState("");

  const debouncedFn = useDebounce((qr: string) => {
    if (qr === "") {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      return;
    }

    void QRCode.toCanvas(canvasRef.current, qr, { width: 296 });
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setDialogOpen((value) => {
          const newValue = !value;

          if (!newValue) setQrInput("");

          return newValue;
        });
      }}
    >
      <DialogTrigger asChild>
        <Button>
          Buat QR Dadakan
          <QRIcon className="ml-2 h-4 w-4 text-cyan-500 dark:text-cyan-600 lg:ml-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            QR Dadakan
          </DialogTitle>
          <DialogDescription>
            Masukan teks yang akan dijadikan kode QR.
          </DialogDescription>

          <div className="flex flex-col items-center gap-3">
            <Input
              value={qrInput}
              onChange={(e) => {
                const val = e.target.value.trim();

                setQrInput(val);
                debouncedFn(val);
              }}
            />

            <canvas ref={canvasRef} className="w-max-lg" />
          </div>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Tutup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
