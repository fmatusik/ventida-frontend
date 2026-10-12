import { Check, Copy } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

type ShareModalProps = {
  shareUrl: string;
  onClose: () => void;
};

export default function ShareModal({ shareUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* brak uprawnień do schowka - użytkownik może skopiować ręcznie z pola */
    }
  };

  return (
    <Modal title="Udostępnij profil" description="Skopiuj link i wyślij go znajomym." onClose={onClose}>
      <div className="flex items-center gap-3">
        <label htmlFor="share-url" className="sr-only">
          Link do profilu
        </label>
        <input
          id="share-url"
          type="text"
          value={shareUrl}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          className="input !bg-neutral-50"
        />
        <button onClick={handleCopy} className="btn-primary whitespace-nowrap">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Skopiowano" : "Kopiuj"}
        </button>
      </div>
    </Modal>
  );
}
