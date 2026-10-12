"use client";
import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
};

/** Dostępny modal: Esc zamyka, focus trafia do okna, tło nie przewija się. */
export default function Modal({ title, description, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // onClose bywa tworzony przy każdym renderze - trzymamy go w ref, by nie restartować efektu
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCloseRef.current()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-3xl bg-white shadow-2xl outline-none`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Zamknij" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
