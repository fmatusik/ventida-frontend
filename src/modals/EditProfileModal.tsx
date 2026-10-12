import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Camera, Check, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import Avatar from "@/components/Avatar";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useUser } from "@/context/UserContext";

type Props = {
  onClose: () => void;
  userId: number;
};

type ProfileForm = {
  username: string;
  name: string;
  surname: string;
  description: string;
  city: string;
  countryCode: string;
  phone_number: string;
  pictureUrl: string;
};

const PASSWORD_HINT = "Min. 8 znaków, mała i wielka litera oraz cyfra";

export default function EditProfileModal({ onClose, userId }: Props) {
  const { logout, refresh } = useUser();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  useEffect(() => {
    api
      .get("/user/me")
      .then((res) => {
        const u = res.data;
        setEmail(u.email ?? "");
        setForm({
          username: u.username ?? "",
          name: u.name ?? "",
          surname: u.surname ?? "",
          description: u.description ?? "",
          city: u.city ?? "",
          countryCode: u.countryCode ?? "",
          phone_number: u.phone_number ?? "",
          pictureUrl: u.pictureUrl ?? "",
        });
      })
      .catch((err) => setLoadError(apiError(err, "Nie udało się pobrać danych użytkownika")));
  }, []);

  const set = (key: keyof ProfileForm, value: string) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Zdjęcie może mieć maksymalnie 5 MB");

    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api.post("/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) set("pictureUrl", res.data.url);
    } catch (err) {
      setError(apiError(err, "Błąd przy przesyłaniu zdjęcia"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      // wysyłamy tylko pola, które backend pozwala edytować
      const { username, ...rest } = form;
      await api.put(`/user/${userId}`, {
        ...rest,
        // pusta nazwa użytkownika = "bez zmian" (backend wymaga 3-30 znaków)
        ...(username.trim() ? { username: username.trim() } : {}),
        countryCode: form.countryCode.trim().toUpperCase(),
      });
      await refresh();
      onClose();
      window.location.reload();
    } catch (err) {
      setError(apiError(err, "Błąd przy zapisywaniu zmian"));
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    setNotice(null);
    if (passwords.newPassword !== passwords.confirmPassword) return setError("Nowe hasła nie są identyczne");
    setSaving(true);
    try {
      await api.put(`/user/${userId}/password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setShowPassword(false);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Hasło zostało zmienione");
    } catch (err) {
      setError(apiError(err, "Błąd przy zmianie hasła"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.delete(`/user/${userId}`);
      logout();
      window.location.href = "/";
    } catch (err) {
      setError(apiError(err, "Błąd przy usuwaniu konta"));
      setSaving(false);
    }
  };

  if (loadError || !form) {
    return (
      <Modal title="Edytuj profil" onClose={onClose} maxWidth="max-w-2xl">
        {loadError ? (
          <p role="alert" className="alert-error">
            {loadError}
          </p>
        ) : (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal title="Edytuj profil" description="Zaktualizuj swoje dane" onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="alert-error">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="alert-success">
            {notice}
          </div>
        )}

        <div className="flex flex-col items-center border-b border-neutral-100 pb-6">
          <div className="relative">
            <Avatar name={form.username || email} src={form.pictureUrl} size={112} />
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </span>
            )}
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2.5 text-white shadow-lg transition-colors focus-within:ring-2 focus-within:ring-primary/50 hover:bg-primary-hover">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Zmień zdjęcie profilowe</span>
              <input
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {form.pictureUrl && (
            <button type="button" onClick={() => set("pictureUrl", "")} className="mt-3 text-xs text-neutral-500 underline hover:text-primary">
              Usuń zdjęcie
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="ep-username" className="label">
              Nazwa użytkownika
            </label>
            <input
              id="ep-username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              pattern="[A-Za-z0-9_.\-]{3,30}"
              title="3–30 znaków: litery, cyfry, _ . -"
              maxLength={30}
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ep-name" className="label">
                Imię
              </label>
              <input id="ep-name" value={form.name} maxLength={60} onChange={(e) => set("name", e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="ep-surname" className="label">
                Nazwisko
              </label>
              <input id="ep-surname" value={form.surname} maxLength={60} onChange={(e) => set("surname", e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="ep-desc" className="label">
              O mnie
            </label>
            <textarea
              id="ep-desc"
              value={form.description}
              maxLength={1000}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="input resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label htmlFor="ep-city" className="label">
                Miasto
              </label>
              <input id="ep-city" value={form.city} maxLength={80} onChange={(e) => set("city", e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="ep-country" className="label">
                Kraj (kod)
              </label>
              <input
                id="ep-country"
                value={form.countryCode}
                onChange={(e) => set("countryCode", e.target.value)}
                placeholder="PL"
                maxLength={2}
                pattern="[A-Za-z]{2}"
                title="Dwuliterowy kod kraju, np. PL"
                className="input uppercase"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t border-neutral-100 pt-6">
          <h3 className="font-semibold">Dane kontaktowe</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ep-phone" className="label">
                Telefon
              </label>
              <input
                id="ep-phone"
                type="tel"
                value={form.phone_number}
                maxLength={20}
                onChange={(e) => set("phone_number", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="ep-email" className="label">
                Email
              </label>
              <input id="ep-email" type="email" value={email} readOnly disabled className="input" />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-neutral-100 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Hasło</h3>
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="btn-outline !px-4 !py-2">
              {showPassword ? "Anuluj" : "Zmień hasło"}
            </button>
          </div>

          {showPassword && (
            <div className="space-y-4 rounded-2xl bg-neutral-50 p-5">
              {(
                [
                  ["oldPassword", "Obecne hasło", "current-password"],
                  ["newPassword", "Nowe hasło", "new-password"],
                  ["confirmPassword", "Powtórz nowe hasło", "new-password"],
                ] as const
              ).map(([key, label, autoComplete]) => (
                <div key={key}>
                  <label htmlFor={`ep-${key}`} className="label">
                    {label}
                  </label>
                  <input
                    id={`ep-${key}`}
                    type="password"
                    autoComplete={autoComplete}
                    maxLength={72}
                    value={passwords[key]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="input"
                  />
                </div>
              ))}
              <p className="text-xs text-neutral-500">{PASSWORD_HINT}</p>
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={saving || !passwords.oldPassword || !passwords.newPassword}
                className="btn-primary w-full"
              >
                Zaktualizuj hasło
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-neutral-100 pt-6">
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            Anuluj
          </button>
          <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Zapisz zmiany
          </button>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)} className="text-sm font-medium text-red-600 hover:underline">
              Usuń konto
            </button>
          ) : (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Konto, ogłoszenia, wiadomości i opinie zostaną trwale usunięte. Tej operacji nie można cofnąć. Wpisz{" "}
                <strong>USUŃ</strong>, aby potwierdzić.
              </p>
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                aria-label="Potwierdź wpisując USUŃ"
                className="input"
                placeholder="USUŃ"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowDelete(false); setDeleteText(""); }} className="btn-outline flex-1">
                  Wróć
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteText.trim().toUpperCase() !== "USUŃ"}
                  className="btn flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  Usuń konto na zawsze
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
