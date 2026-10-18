"use client";

import type { User } from "@krykftn/client";
import { useAuth } from "@krykftn/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api, kf } from "@/lib/kf.ts";
import {
  DAYS,
  isLive,
  type PersonInput,
  type PersonView,
  SLOTS,
  type State,
  stepTitle,
  type TargetInput,
} from "@/lib/model.ts";

const visible = (): boolean => (typeof document === "undefined" ? true : document.visibilityState === "visible");

const isValidTC = (val: string): boolean => {
  if (!/^[1-9]\d{10}$/.test(val)) return false;
  const d = val.split("").map(Number);
  if (d.length !== 11) return false;
  const [d0 = 0, d1 = 0, d2 = 0, d3 = 0, d4 = 0, d5 = 0, d6 = 0, d7 = 0, d8 = 0, d9 = 0, d10 = 0] = d;
  const oddSum = d0 + d2 + d4 + d6 + d8;
  const evenSum = d1 + d3 + d5 + d7;
  let check10 = (oddSum * 7 - evenSum) % 10;
  if (check10 < 0) check10 += 10;
  if (check10 !== d9) return false;
  const sum10 = d.slice(0, 10).reduce((acc, cur) => acc + cur, 0);
  return sum10 % 10 === d10;
};

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

const SignInGate = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setBusy(true);
      setError(null);
      await kf.auth.signInWithGoogle({ redirect: window.location.href });
    } catch (err: unknown) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Giriş başlatılamadı");
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-line bg-paper p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent text-3xl shadow-sm border border-accent/20">
          🏥
        </div>
        <h1 className="text-2xl font-black tracking-tight text-ink">İTF Randevu Asistanı</h1>
        <p className="mt-2 text-sm text-muted">
          İstanbul Tıp Fakültesi (Çapa) randevularını her akşam <strong>20:00</strong> açılışında saniyesinde yakalar.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4 text-left text-xs text-muted space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-[11px]">1</span>
            <span className="text-ink-soft">Google hesabınızla tek tıkla oturum açın</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-[11px]">2</span>
            <span className="text-ink-soft">Aile üyelerinizi (Babam, Kendim, Annem) ekleyin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-[11px]">3</span>
            <span className="text-ink-soft">Dahiliye 21 polikliniğini ve gün tercihinizi belirleyin</span>
          </div>
        </div>

        <button
          onClick={() => void handleSignIn()}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:shadow active:scale-[0.98] disabled:opacity-70"
        >
          <IconGoogle />
          <span>{busy ? "Google'a yönlendiriliyor…" : "Google ile Giriş Yap"}</span>
        </button>

        {error && <p className="mt-3 text-xs text-hospital font-medium">{error}</p>}
      </div>
    </div>
  );
};

const getRelationBadge = (relation?: string) => {
  const r = (relation || "").toLowerCase();
  if (r.includes("baba")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (r.includes("kendi") || r.includes("ben")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (r.includes("anne")) return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getPersonInitial = (name: string) => {
  if (!name) return "👤";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (first && second) return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const CountdownBanner = ({ nextOpening }: { nextOpening: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const target = new Date(nextOpening).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextOpening]);

  const isUnderTenMin = timeLeft && timeLeft.hours === 0 && timeLeft.minutes < 10;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition ${
        isUnderTenMin
          ? "border-hospital/40 bg-gradient-to-r from-red-50 to-orange-50"
          : "border-accent/20 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs ${
              isUnderTenMin ? "bg-red-500 text-white animate-bounce" : "bg-accent text-white"
            }`}
          >
            ⏰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-ink">20:00 Randevu Açılış Sayacı</h2>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/20">
                Her Gün 20:00
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              İTF sistemi 20:00:00&apos;da açılır. Botumuz <strong>19:59:45</strong>&apos;te nöbete girer.
            </p>
          </div>
        </div>

        {timeLeft && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto font-mono text-xs font-bold bg-white px-3.5 py-2 rounded-xl border border-line shadow-xs">
            <span className="text-muted text-[10px] uppercase font-sans mr-1">Kalan:</span>
            <span className="rounded bg-paper-2 px-1.5 py-0.5 text-accent">{String(timeLeft.hours).padStart(2, "0")}s</span>
            <span>:</span>
            <span className="rounded bg-paper-2 px-1.5 py-0.5 text-accent">{String(timeLeft.minutes).padStart(2, "0")}d</span>
            <span>:</span>
            <span className={`rounded px-1.5 py-0.5 ${isUnderTenMin ? "bg-red-100 text-red-600" : "bg-paper-2 text-accent"}`}>
              {String(timeLeft.seconds).padStart(2, "0")}sn
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New person modal/form toggle
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [pName, setPName] = useState("");
  const [pRelation, setPRelation] = useState("Babam");
  const [pTc, setPTc] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pFather, setPFather] = useState("");
  const [pBirthDate, setPBirthDate] = useState("");

  // New target modal/form toggle
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [tPersonId, setTPersonId] = useState("");
  const [tDay, setTDay] = useState("perşembe");
  const [tRoom, setTRoom] = useState("Dahiliye 21");
  const [tSlot, setTSlot] = useState("early");

  // Active console log expansion
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await api.me();
      setState(data);
      const firstPerson = data.people?.[0];
      if (firstPerson && !tPersonId) 
        setTPersonId(firstPerson.id);
      
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [tPersonId]);

  useEffect(() => {
    const first = setTimeout(() => {
      void reload();
    }, 0);
    const timer = setInterval(() => {
      if (visible()) void reload();
    }, 3500);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [reload]);

  const liveJobs = useMemo(() => (state?.jobs || []).filter(isLive), [state?.jobs]);

  const tcValid = useMemo(() => isValidTC(pTc), [pTc]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcValid) {
      alert("Lütfen geçerli 11 haneli T.C. Kimlik Numarası girin.");
      return;
    }
    try {
      setLoading(true);
      const input: PersonInput = {
        name: pName.trim(),
        relation: pRelation.trim(),
        tc: pTc.trim(),
        phone: pPhone.trim(),
        fatherName: pFather.trim(),
        birthDate: pBirthDate.trim(),
      };
      await api.addPerson(input);
      setShowPersonForm(false);
      setPName("");
      setPTc("");
      setPPhone("");
      setPFather("");
      setPBirthDate("");
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı kişiyi ve ilişkili hedefleri silmek istediğinizden emin misiniz?`)) return;
    try {
      setLoading(true);
      await api.deletePerson(id);
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tPersonId) {
      alert("Lütfen hedefin atanacağı kişiyi seçin.");
      return;
    }
    try {
      setLoading(true);
      const input: TargetInput = {
        personId: tPersonId,
        campus: "Çapa",
        branch: "İç Hastalıkları",
        polyclinics: [tRoom],
        targetDay: tDay,
        slot: tSlot,
      };
      await api.addTarget(input);
      setShowTargetForm(false);
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    try {
      setLoading(true);
      await api.removeTarget(id);
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleRunTarget = async (id: string, dryRun: boolean) => {
    try {
      await api.runTarget(id, dryRun);
      await reload();
      setExpandedLogId(id);
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await api.cancelJob(jobId);
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const peopleMap = useMemo(() => {
    const map = new Map<string, PersonView>();
    (state?.people || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [state?.people]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Üst Header & Kullanıcı Çubuğu */}
      <header className="rounded-2xl border border-line bg-paper p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white text-2xl shadow-sm">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-ink">İTF Randevu Botu</h1>
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent border border-accent/20">
                  Çapa v2.0
                </span>
              </div>
              <p className="text-xs text-muted">İstanbul Tıp Fakültesi · Çoklu Kişi & Hedef Otomasyonu</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Tünel & Server Aktif
            </span>
            <div className="flex items-center gap-2 rounded-xl bg-paper-2 px-3 py-1.5 text-xs border border-line">
              <span className="font-medium text-ink-soft truncate max-w-[150px] sm:max-w-none">
                {user.email || user.displayName}
              </span>
              <button
                onClick={() => void kf.auth.signOut()}
                className="text-hospital font-semibold hover:underline ml-1"
                title="Oturumu Kapat"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 20:00 Sayacı */}
      {state?.nextOpening && <CountdownBanner nextOpening={state.nextOpening} />}

      {/* Canlı Çalışan İş Bildirimi */}
      {liveJobs.length > 0 && (
        <section className="rounded-2xl border-2 border-accent bg-sky-50/50 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-accent animate-ping" />
              <h2 className="text-sm font-bold text-accent">Canlı İşlem Sürüyor ({liveJobs.length})</h2>
            </div>
            <span className="text-xs text-muted font-medium">Anlık güncelleniyor</span>
          </div>

          <div className="space-y-3">
            {liveJobs.map((j) => (
              <div key={j.id} className="rounded-xl border border-accent/20 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-ink">{j.personName || "Randevu İşi"}</span>
                    <span className="text-xs text-muted ml-2">{j.summary || "Hedefe gidiliyor"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {j.dryRun && (
                      <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold">
                        TEST MODU
                      </span>
                    )}
                    <button
                      onClick={() => handleCancelJob(j.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Durdur
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-paper-2 p-2.5 text-xs font-medium text-accent border border-line flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>{stepTitle(j.step)}</span>
                </div>

                {j.log && j.log.length > 0 && (
                  <div className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200 max-h-36 overflow-y-auto space-y-1">
                    {j.log.slice(-6).map((l, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500 mr-2">
                          {new Date(l.at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <span className={l.level === "good" ? "text-emerald-400 font-semibold" : l.level === "warn" ? "text-rose-400" : ""}>
                          {l.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-2xl border border-hospital/30 bg-hospital-soft p-4 text-sm text-hospital">
          {error}
        </div>
      )}

      {/* 1. BÖLÜM: KİŞİLERİM (AİLE ÜYELERİ) */}
      <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>👥</span> Kişilerim & Aile Üyeleri
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Randevu alınacak kişileri ve T.C. kimlik bilgilerini buradan yönetin.
            </p>
          </div>
          <button
            onClick={() => setShowPersonForm(!showPersonForm)}
            className="rounded-xl bg-accent hover:bg-accent-hover text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>{showPersonForm ? "✕ Vazgeç" : "+ Yeni Kişi Ekle"}</span>
          </button>
        </div>

        {/* Yeni Kişi Formu */}
        {showPersonForm && (
          <form onSubmit={handleAddPerson} className="mb-5 rounded-xl border border-accent/30 bg-sky-50/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Yeni Kişi Kaydı</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Kaftanoğlu"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Yakınlık / Etiket</label>
                <div className="flex gap-1.5 flex-wrap">
                  {["Babam", "Kendim", "Annem", "Eşim", "Diğer"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setPRelation(r)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                        pRelation === r ? "bg-accent text-white border-accent" : "bg-white text-ink-soft border-line"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-ink-soft">T.C. Kimlik No</label>
                  {pTc.length === 11 && (
                    <span className={`text-[11px] font-bold ${tcValid ? "text-emerald-600" : "text-rose-500"}`}>
                      {tcValid ? "✓ Geçerli T.C." : "✕ Hatalı Numara"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="11 Haneli T.C."
                  value={pTc}
                  onChange={(e) => setPTc(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Cep Telefonu</label>
                <input
                  type="tel"
                  required
                  placeholder="0532..."
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Baba Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hasan"
                  value={pFather}
                  onChange={(e) => setPFather(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Doğum Tarihi (GG.AA.YYYY)</label>
                <input
                  type="text"
                  required
                  placeholder="01.01.1960"
                  value={pBirthDate}
                  onChange={(e) => setPBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !tcValid}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
            >
              Kişiyi Güvenle Kaydet
            </button>
          </form>
        )}

        {/* Kişi Kartları */}
        {state?.people && state.people.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.people.map((person) => {
              const targetCount = (state.targets || []).filter((t) => t.accountId === person.id).length;
              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-line bg-paper-2 p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-accent/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                        {getPersonInitial(person.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-ink">{person.name}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getRelationBadge(person.relation)}`}>
                            {person.relation || "Kişi"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted mt-1 font-mono">
                          <span>TC: {person.maskedTc}</span>
                          <span>Tel: {person.maskedPhone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePerson(person.id, person.name)}
                      className="text-xs text-muted hover:text-hospital p-1 transition"
                      title="Kişiyi Sil"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/60 pt-2 text-xs">
                    <span className="text-muted">
                      {targetCount > 0 ? (
                        <span className="font-semibold text-accent">🎯 {targetCount} aktif hedef var</span>
                      ) : (
                        <span>Henüz hedef yok</span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        setTPersonId(person.id);
                        setShowTargetForm(true);
                      }}
                      className="text-accent font-semibold hover:underline"
                    >
                      + Hedef Belirle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
            Henüz kimse eklenmedi. Randevu alabilmek için yukarıdaki &quot;+ Yeni Kişi Ekle&quot; butonu ile kendinizi veya babanızı ekleyin.
          </div>
        )}
      </section>

      {/* 2. BÖLÜM: RANDEVU HEDEFLERİ */}
      <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>🎯</span> Randevu Hedefleri
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Hangi aile üyesi için hangi poliklinik ve güne randevu aranacak?
            </p>
          </div>
          {state?.people && state.people.length > 0 && (
            <button
              onClick={() => setShowTargetForm(!showTargetForm)}
              className="rounded-xl bg-accent hover:bg-accent-hover text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>{showTargetForm ? "✕ Vazgeç" : "+ Yeni Hedef Ekle"}</span>
            </button>
          )}
        </div>

        {/* Yeni Hedef Formu */}
        {showTargetForm && (
          <form onSubmit={handleAddTarget} className="mb-5 rounded-xl border border-accent/30 bg-sky-50/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Yeni Hedef Oluştur</h3>

            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Kime Randevu Alınacak?</label>
              <select
                value={tPersonId}
                onChange={(e) => setTPersonId(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {(state?.people || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relation || "Kişi"}) — TC: {p.maskedTc}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Hedef Gün</label>
                <select
                  value={tDay}
                  onChange={(e) => setTDay(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Poliklinik / Oda</label>
                <select
                  value={tRoom}
                  onChange={(e) => setTRoom(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Dahiliye 21">Dahiliye 21 (Öncelikli)</option>
                  <option value="Dahiliye">Herhangi bir Dahiliye Odası</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">Saat Tercihi</label>
                <select
                  value={tSlot}
                  onChange={(e) => setTSlot(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {SLOTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Hedefi Kaydet ve Nöbete Al
            </button>
          </form>
        )}

        {/* Hedef Listesi */}
        {state?.targets && state.targets.length > 0 ? (
          <div className="space-y-3">
            {state.targets.map((target) => {
              const person = peopleMap.get(target.accountId);
              const slotInfo = SLOTS.find((s) => s.key === target.slot);
              return (
                <div
                  key={target.id}
                  className="rounded-xl border border-line bg-paper-2 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-accent/40 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-lg bg-blue-600 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                        👤 {person ? `${person.name} (${person.relation || "Kişi"})` : "Bilinmeyen Kişi"}
                      </span>
                      <span className="rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-bold">
                        {target.polyclinics?.join(", ") || "Dahiliye 21"}
                      </span>
                      <span className="rounded-lg bg-paper border border-line px-2 py-0.5 text-xs font-medium text-ink-soft">
                        📅 {target.targetDay ? target.targetDay.toUpperCase() : "İlk Boş Gün"}
                      </span>
                      {slotInfo && (
                        <span className="rounded-lg bg-paper border border-line px-2 py-0.5 text-xs font-medium text-muted">
                          ⏰ {slotInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted">
                      {target.campus} Yerleşkesi · {target.branch} Polikliniği
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line/60">
                    <button
                      onClick={() => handleRunTarget(target.id, true)}
                      className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold transition active:scale-[0.98]"
                      title="Randevu almadan son adıma kadar test eder"
                    >
                      🧪 Test Et
                    </button>
                    <button
                      onClick={() => handleRunTarget(target.id, false)}
                      className="rounded-lg bg-accent hover:bg-accent-hover text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-[0.98]"
                      title="Hemen randevuyu alır"
                    >
                      ⚡ Şimdi Al
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(target.id)}
                      className="rounded-lg border border-line hover:border-rose-300 hover:text-rose-600 px-2.5 py-1.5 text-xs text-muted transition"
                      title="Hedefi Sil"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
            Henüz aktif randevu hedefi oluşturulmadı.
          </div>
        )}
      </section>

      {/* 3. BÖLÜM: GEÇMİŞ VE İŞ TAKİBİ */}
      {state?.jobs && state.jobs.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>📋</span> Randevu Takip & İşlem Kayıtları
            </h2>
            <span className="text-xs text-muted">Son işlemler</span>
          </div>

          <div className="space-y-3">
            {state.jobs.slice(0, 10).map((j) => {
              const isExpanded = expandedLogId === j.id;
              return (
                <div key={j.id} className="rounded-xl border border-line bg-paper-2 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted">
                        {new Date(j.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className="font-bold text-ink">{j.personName || "İş"}</span>
                      {j.summary && <span className="text-muted text-[11px]">({j.summary})</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {j.dryRun && (
                        <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold">
                          TEST
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          j.status === "done"
                            ? "bg-emerald-100 text-emerald-700"
                            : j.status === "running"
                            ? "bg-blue-100 text-blue-700 animate-pulse"
                            : j.status === "failed"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {j.status === "done"
                          ? "Tamamlandı"
                          : j.status === "running"
                          ? "Çalışıyor"
                          : j.status === "failed"
                          ? "Başarısız"
                          : j.status}
                      </span>
                    </div>
                  </div>

                  {j.result && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs font-semibold text-emerald-800">
                      🎉 {j.result}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : j.id)}
                      className="text-accent hover:underline font-semibold"
                    >
                      {isExpanded ? "▲ Logları Gizle" : `▼ Konsol Loglarını Gör (${j.log?.length || 0})`}
                    </button>
                    {j.status === "running" && (
                      <button
                        onClick={() => handleCancelJob(j.id)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        İşlemi Durdur
                      </button>
                    )}
                  </div>

                  {isExpanded && j.log && j.log.length > 0 && (
                    <div className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200 max-h-48 overflow-y-auto space-y-1">
                      {j.log.map((l, idx) => (
                        <div key={idx} className="leading-tight">
                          <span className="text-slate-500 mr-2">
                            {new Date(l.at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                          <span className={l.level === "good" ? "text-emerald-400 font-semibold" : l.level === "warn" ? "text-rose-400" : ""}>
                            {l.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default function Home() {
  const { user, loading } = useAuth(kf);

  if (loading && !user) 
    return (
      <div className="grid min-h-dvh place-items-center bg-ground">
        <div className="text-center text-sm text-muted">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Oturum kontrol ediliyor…
        </div>
      </div>
    );
  

  if (!user || user.isAnonymous) 
    return <SignInGate />;
  

  return <Dashboard user={user} />;
}
