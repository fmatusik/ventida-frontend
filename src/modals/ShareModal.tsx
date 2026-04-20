import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';

type ShareModalProps = {
    shareUrl: string;
    onClose: () => void;
};

export default function ShareModal({ shareUrl, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-sm shadow-xl p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-light mb-2">Share Profile</h2>
                <p className="text-sm text-neutral-600 mb-8">
                    Copy the link below to share this profile
                </p>
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-3 text-sm border border-neutral-300 bg-neutral-50 text-neutral-700 focus:outline-none focus:border-neutral-400 transition-colors"
                        />
                        <button
                            onClick={handleCopy}
                            className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}