"use client";

import type { User } from "@krykftn/client";
import { useAuth } from "@krykftn/client/react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { api, kf } from "@/lib/kf.ts";
import {
  BRANCH_GROUPS,
  CAMPUSES,
  CAPA_MERKEZ,
  COMMON_BRANCHES,
  CUSTOM,
  DAYS,
  DEFAULT_BRANCH,
  DEFAULT_ROOM,
  fold,
  initials,
  isDahiliye,
  isLive,
  isValidTC,
  type JobStatus,
  type LogLine,
  type PersonInput,
  type PersonView,
  pollDelay,
  QUICK_BRANCHES,
  RELATIONS,
  type SlotKey,
  SLOTS,
  type State,
  stepTitle,
  suggestCampus,
  type TargetInput,
} from "@/lib/model.ts";

const FIELD = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const LABEL = "block text-xs font-medium text-ink-soft mb-1";
const SUBMIT =
  "w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50";
const FORM = "mb-5 rounded-xl border border-accent/30 bg-sky-50/40 p-4 space-y-3";
const EMPTY = "rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted";

const CLOCK = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const clock = (iso: string): string => CLOCK.format(new Date(iso));

const pad = (n: number): string => String(n).padStart(2, "0");

const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const LOG_TONE: Record<LogLine["level"], string> = {
  info: "",
  good: "text-emerald-400 font-semibold",
  warn: "text-rose-400",
};

const JOB_STATUS: Record<JobStatus, { label: string; tone: string }> = {
  queued: { label: "Sırada", tone: "bg-slate-100 text-slate-700" },
  running: { label: "Çalışıyor", tone: "bg-blue-100 text-blue-700 animate-pulse" },
  done: { label: "Tamamlandı", tone: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Başarısız", tone: "bg-rose-100 text-rose-700" },
  cancelled: { label: "Durduruldu", tone: "bg-slate-100 text-slate-700" },
};

const BRANCH_OPTIONS = BRANCH_GROUPS.map((g) => ({ ...g, items: COMMON_BRANCHES.filter((b) => b.category === g.category) }));

const relationTone = (relation = ""): string => {
  const r = fold(relation);
  if (r.includes("baba")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (r.includes("kendi") || r.includes("ben")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (r.includes("anne")) return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
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
          {[
            "Google hesabınızla tek tıkla oturum açın",
            "Aile üyelerinizi (Babam, Kendim, Annem) ekleyin",
            "Dahiliye 21 polikliniğini ve gün tercihinizi belirleyin",
          ].map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-[11px]">
                {idx + 1}
              </span>
              <span className="text-ink-soft">{step}</span>
            </div>
          ))}
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

const CountdownBanner = ({ nextOpening }: { nextOpening: string }) => {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse(nextOpening);
    const update = () => setLeft(Math.max(0, target - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [nextOpening]);

  const urgent = left !== null && left < 10 * 60_000;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition ${
        urgent ? "border-hospital/40 bg-gradient-to-r from-red-50 to-orange-50" : "border-accent/20 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs ${
              urgent ? "bg-red-500 text-white animate-bounce" : "bg-accent text-white"
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

        {left !== null && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto font-mono text-xs font-bold bg-white px-3.5 py-2 rounded-xl border border-line shadow-xs">
            <span className="text-muted text-[10px] uppercase font-sans mr-1">Kalan:</span>
            <span className="rounded bg-paper-2 px-1.5 py-0.5 text-accent">{pad(Math.floor(left / 3_600_000))}s</span>
            <span>:</span>
            <span className="rounded bg-paper-2 px-1.5 py-0.5 text-accent">{pad(Math.floor(left / 60_000) % 60)}d</span>
            <span>:</span>
            <span className={`rounded px-1.5 py-0.5 ${urgent ? "bg-red-100 text-red-600" : "bg-paper-2 text-accent"}`}>
              {pad(Math.floor(left / 1000) % 60)}sn
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const LogList = ({ lines, className }: { lines: LogLine[]; className: string }) => (
  <div className={`rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-y-auto space-y-1 ${className}`}>
    {lines.map((l, idx) => (
      <div key={idx} className="leading-relaxed">
        <span className="text-slate-500 mr-2">{clock(l.at)}</span>
        <span className={LOG_TONE[l.level]}>{l.message}</span>
        {(l.count ?? 0) > 1 && <span className="ml-1.5 text-slate-500">×{l.count}</span>}
      </div>
    ))}
  </div>
);

const SectionHead = ({ icon, title, hint, children }: { icon: string; title: string; hint?: string; children?: ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-base font-bold text-ink flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const ToggleButton = ({ open, label, onClick }: { open: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-xl bg-accent hover:bg-accent-hover text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-[0.98] flex items-center gap-1.5"
  >
    <span>{open ? "✕ Vazgeç" : label}</span>
  </button>
);

const Field = ({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) => (
  <label className="block">
    <span className="flex justify-between items-center mb-1 text-xs font-medium text-ink-soft">
      {label}
      {aside}
    </span>
    {children}
  </label>
);

const EMPTY_PERSON: PersonInput = { name: "", relation: RELATIONS[0], tc: "", phone: "", fatherName: "", birthDate: "" };

const PersonForm = ({ busy, onSave }: { busy: boolean; onSave: (input: PersonInput) => void }) => {
  const [form, setForm] = useState(EMPTY_PERSON);
  const update = (patch: Partial<PersonInput>) => setForm((f) => ({ ...f, ...patch }));
  const tcValid = isValidTC(form.tc);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (tcValid)
      onSave({
        name: form.name.trim(),
        relation: form.relation?.trim(),
        tc: form.tc,
        phone: form.phone.trim(),
        fatherName: form.fatherName.trim(),
        birthDate: form.birthDate.trim(),
      });
  };

  return (
    <form onSubmit={submit} className={FORM}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Yeni Kişi Kaydı</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Ad Soyad">
          <input
            type="text"
            required
            placeholder="Örn: Mehmet Kaftanoğlu"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            className={FIELD}
          />
        </Field>

        <div>
          <span className={LABEL}>Yakınlık / Etiket</span>
          <div className="flex gap-1.5 flex-wrap">
            {RELATIONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => update({ relation: r })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                  form.relation === r ? "bg-accent text-white border-accent" : "bg-white text-ink-soft border-line"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="T.C. Kimlik No"
          aside={
            form.tc.length === 11 && (
              <span className={`text-[11px] font-bold ${tcValid ? "text-emerald-600" : "text-rose-500"}`}>
                {tcValid ? "✓ Geçerli T.C." : "✕ Hatalı Numara"}
              </span>
            )
          }
        >
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={11}
            placeholder="11 Haneli T.C."
            value={form.tc}
            onChange={(e) => update({ tc: e.target.value.replace(/\D/g, "") })}
            className={`${FIELD} font-mono`}
          />
        </Field>

        <Field label="Cep Telefonu">
          <input
            type="tel"
            required
            placeholder="0532..."
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className={FIELD}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Baba Adı">
          <input
            type="text"
            required
            placeholder="Örn: Hasan"
            value={form.fatherName}
            onChange={(e) => update({ fatherName: e.target.value })}
            className={FIELD}
          />
        </Field>

        <Field label="Doğum Tarihi (GG.AA.YYYY)">
          <input
            type="text"
            required
            placeholder="01.01.1960"
            value={form.birthDate}
            onChange={(e) => update({ birthDate: e.target.value })}
            className={FIELD}
          />
        </Field>
      </div>

      <button type="submit" disabled={busy || !tcValid} className={SUBMIT}>
        Kişiyi Güvenle Kaydet
      </button>
    </form>
  );
};

type TargetFormProps = {
  people: PersonView[];
  personId: string;
  onPersonChange: (id: string) => void;
  busy: boolean;
  onSave: (input: TargetInput) => void;
};

const TargetForm = ({ people, personId, onPersonChange, busy, onSave }: TargetFormProps) => {
  const [campus, setCampus] = useState(CAPA_MERKEZ);
  const [branch, setBranch] = useState(DEFAULT_BRANCH);
  const [customBranch, setCustomBranch] = useState("");
  const [room, setRoom] = useState(DEFAULT_ROOM);
  const [customRoom, setCustomRoom] = useState("");
  const [day, setDay] = useState("perşembe");
  const [slot, setSlot] = useState<SlotKey>("early");

  const branchName = (branch === CUSTOM ? customBranch : branch).trim();
  const roomName = (room === CUSTOM ? customRoom : room).trim();
  const dahiliye = isDahiliye(branchName);

  const pickBranch = (next: string) => {
    setBranch(next);
    const suggested = suggestCampus(next);
    if (suggested) setCampus(suggested);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!personId) {
      alert("Lütfen hedefin atanacağı kişiyi seçin.");
      return;
    }
    if (!branchName) {
      alert("Lütfen geçerli bir branş seçin veya yazın.");
      return;
    }
    onSave({
      personId,
      campus: campus.trim(),
      branch: branchName,
      polyclinics: dahiliye && roomName ? [roomName] : [],
      targetDay: day,
      slot,
    });
  };

  return (
    <form onSubmit={submit} className={FORM}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Yeni Hedef Oluştur</h3>

      <Field label="Kime Randevu Alınacak?">
        <select value={personId} onChange={(e) => onPersonChange(e.target.value)} className={`${FIELD} font-semibold`}>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.relation || "Kişi"}) — TC: {p.maskedTc}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Field label="Yerleşke (Şube / Kampüs)">
            <select value={campus} onChange={(e) => setCampus(e.target.value)} className={`${FIELD} font-semibold`}>
              {CAMPUSES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[11px] text-muted mt-1 leading-snug">
            ℹ️ {CAMPUSES.find((c) => c.key === campus)?.desc ?? "Otomatik veya serbest seçim"}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="block text-xs font-medium text-ink-soft">Ana Branş</span>
            <span className="text-[10px] text-muted">Hızlı Seçim:</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {QUICK_BRANCHES.map((quick) => (
              <button
                type="button"
                key={quick.key}
                onClick={() => pickBranch(quick.key)}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold border transition ${
                  branch === quick.key
                    ? "bg-accent text-white border-accent shadow-xs"
                    : "bg-white text-ink-soft border-line hover:border-accent/40"
                }`}
              >
                {quick.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Ana Branş"
            value={branch}
            onChange={(e) => pickBranch(e.target.value)}
            className={`${FIELD} font-semibold`}
          >
            {BRANCH_OPTIONS.map((g) => (
              <optgroup key={g.category} label={g.label}>
                {g.items.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM}>✏️ Diğer (Özel Branş Yaz…)</option>
          </select>
        </div>
      </div>

      {branch === CUSTOM && (
        <label className="block">
          <span className="block text-xs font-medium text-accent mb-1">Özel Branş Adı</span>
          <input
            type="text"
            required
            placeholder="Örn: Kalp ve Damar Cerrahisi, Radyoloji, vb."
            value={customBranch}
            onChange={(e) => setCustomBranch(e.target.value)}
            className={`${FIELD} border-accent`}
          />
        </label>
      )}

      {dahiliye ? (
        <div>
          <Field label="Dahiliye Poliklinik Odası">
            <select value={room} onChange={(e) => setRoom(e.target.value)} className={`${FIELD} font-semibold`}>
              <option value={DEFAULT_ROOM}>{DEFAULT_ROOM} (Öncelikli)</option>
              <option value="Dahiliye">Herhangi bir Dahiliye Odası</option>
              <option value={CUSTOM}>✏️ Özel Oda Numarası Yaz…</option>
            </select>
          </Field>

          {room === CUSTOM && (
            <input
              type="text"
              required
              aria-label="Özel oda numarası"
              placeholder="Örn: Dahiliye 5, Dahiliye 12, vb."
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              className={`${FIELD} border-accent mt-2`}
            />
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-blue-50/60 border border-blue-200/60 p-2.5 text-[11px] text-blue-900 flex items-center gap-2">
          <span>✨</span>
          <span>
            <strong>{branchName || "Bu branşta"}</strong> doğrudan randevu takvimi açılır, poliklinik oda seçimi adımı yoktur.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Hedef Gün">
          <select value={day} onChange={(e) => setDay(e.target.value)} className={FIELD}>
            {DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Saat Tercihi">
          <select value={slot} onChange={(e) => setSlot(e.target.value as SlotKey)} className={FIELD}>
            {SLOTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({s.desc})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button type="submit" disabled={busy} className={SUBMIT}>
        Hedefi Kaydet ve Nöbete Al
      </button>
    </form>
  );
};

const useLiveState = () => {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reloadRef = useRef(async () => {});

  useEffect(() => {
    let latest: State | null = null;
    let seq = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const visible = () => document.visibilityState === "visible";
    const reload = async () => {
      const id = ++seq;
      clearTimeout(timer);
      try {
        const data = await api.me();
        if (id !== seq) return;
        latest = data;
        setState(data);
        setError(null);
      } catch (err: unknown) {
        if (id === seq) setError(errorText(err));
      } finally {
        if (id === seq) timer = setTimeout(() => visible() && void reload(), pollDelay(latest));
      }
    };
    const onVisible = () => visible() && void reload();
    reloadRef.current = reload;
    void reload();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      seq++;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { state, error, reload: () => reloadRef.current() };
};

const Dashboard = ({ user }: { user: User }) => {
  const { state, error, reload } = useLiveState();
  const [busy, setBusy] = useState(false);
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [targetFormOpen, setTargetFormOpen] = useState(false);
  const [chosenPerson, setChosenPerson] = useState("");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const act = async (task: () => Promise<unknown>, onDone?: () => void) => {
    setBusy(true);
    try {
      await task();
      onDone?.();
      await reload();
    } catch (err: unknown) {
      alert(`Hata: ${errorText(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const deletePerson = (person: PersonView) => {
    if (confirm(`"${person.name}" adlı kişiyi ve ilişkili hedefleri silmek istediğinizden emin misiniz?`))
      void act(() => api.deletePerson(person.id));
  };

  const runTarget = (id: string, dryRun: boolean) => void act(async () => setExpandedJob((await api.runTarget(id, dryRun)).id));

  const cancelJob = (id: string) => void act(() => api.cancelJob(id));

  const people = state?.people ?? [];
  const targets = state?.targets ?? [];
  const jobs = state?.jobs ?? [];
  const liveJobs = jobs.filter(isLive);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const personId = peopleById.has(chosenPerson) ? chosenPerson : (people[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
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
              <span className="font-medium text-ink-soft truncate max-w-[150px] sm:max-w-none">{user.email || user.displayName}</span>
              <button onClick={() => void kf.auth.signOut()} className="text-hospital font-semibold hover:underline ml-1" title="Oturumu Kapat">
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {state?.nextOpening && <CountdownBanner nextOpening={state.nextOpening} />}

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
                    {j.dryRun && <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold">TEST MODU</span>}
                    <button
                      onClick={() => cancelJob(j.id)}
                      disabled={busy}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Durdur
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-paper-2 p-2.5 text-xs font-medium text-accent border border-line flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>{stepTitle(j.step)}</span>
                </div>

                {j.log.length > 0 && <LogList lines={j.log.slice(-6)} className="max-h-36" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <div className="rounded-2xl border border-hospital/30 bg-hospital-soft p-4 text-sm text-hospital">{error}</div>}

      <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <SectionHead icon="👥" title="Kişilerim & Aile Üyeleri" hint="Randevu alınacak kişileri ve T.C. kimlik bilgilerini buradan yönetin.">
          <ToggleButton open={personFormOpen} label="+ Yeni Kişi Ekle" onClick={() => setPersonFormOpen(!personFormOpen)} />
        </SectionHead>

        {personFormOpen && (
          <PersonForm busy={busy} onSave={(input) => void act(() => api.addPerson(input), () => setPersonFormOpen(false))} />
        )}

        {people.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {people.map((person) => {
              const targetCount = targets.filter((t) => t.accountId === person.id).length;
              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-line bg-paper-2 p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-accent/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                        {initials(person.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-ink">{person.name}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${relationTone(person.relation)}`}>
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
                      onClick={() => deletePerson(person)}
                      disabled={busy}
                      className="text-xs text-muted hover:text-hospital p-1 transition disabled:opacity-50"
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
                        setChosenPerson(person.id);
                        setTargetFormOpen(true);
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
          <div className={EMPTY}>
            Henüz kimse eklenmedi. Randevu alabilmek için yukarıdaki &quot;+ Yeni Kişi Ekle&quot; butonu ile kendinizi veya babanızı ekleyin.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <SectionHead icon="🎯" title="Randevu Hedefleri" hint="Hangi aile üyesi için hangi poliklinik ve güne randevu aranacak?">
          {people.length > 0 && (
            <ToggleButton open={targetFormOpen} label="+ Yeni Hedef Ekle" onClick={() => setTargetFormOpen(!targetFormOpen)} />
          )}
        </SectionHead>

        {targetFormOpen && people.length > 0 && (
          <TargetForm
            people={people}
            personId={personId}
            onPersonChange={setChosenPerson}
            busy={busy}
            onSave={(input) => void act(() => api.addTarget(input), () => setTargetFormOpen(false))}
          />
        )}

        {targets.length > 0 ? (
          <div className="space-y-3">
            {targets.map((target) => {
              const person = peopleById.get(target.accountId);
              const slot = SLOTS.find((s) => s.key === target.slot);
              const rooms = target.polyclinics.length > 0 ? target.polyclinics.join(", ") : isDahiliye(target.branch) ? DEFAULT_ROOM : "";
              const running = liveJobs.some((j) => j.targetId === target.id);
              return (
                <div
                  key={target.id}
                  className="rounded-xl border border-line bg-paper-2 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-accent/40 transition"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-lg bg-blue-600 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                      👤 {person ? `${person.name} (${person.relation || "Kişi"})` : "Bilinmeyen Kişi"}
                    </span>
                    <span className="rounded-lg bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 text-xs font-bold">
                      📍 {target.campus || "Herhangi bir yerleşke"} · {target.branch || DEFAULT_BRANCH}
                    </span>
                    {rooms && (
                      <span className="rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-bold">
                        🏥 {rooms}
                      </span>
                    )}
                    <span className="rounded-lg bg-paper border border-line px-2 py-0.5 text-xs font-medium text-ink-soft">
                      📅 {target.targetDay ? target.targetDay.toLocaleUpperCase("tr") : "İlk Boş Gün"}
                    </span>
                    {slot && (
                      <span className="rounded-lg bg-paper border border-line px-2 py-0.5 text-xs font-medium text-muted">⏰ {slot.label}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line/60">
                    <button
                      onClick={() => runTarget(target.id, true)}
                      disabled={busy || running}
                      className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold transition active:scale-[0.98] disabled:opacity-50"
                      title="Randevu almadan son adıma kadar test eder"
                    >
                      🧪 Test Et
                    </button>
                    <button
                      onClick={() => runTarget(target.id, false)}
                      disabled={busy || running}
                      className="rounded-lg bg-accent hover:bg-accent-hover text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-[0.98] disabled:opacity-50"
                      title="Hemen randevuyu alır"
                    >
                      ⚡ Şimdi Al
                    </button>
                    <button
                      onClick={() => void act(() => api.removeTarget(target.id))}
                      disabled={busy}
                      className="rounded-lg border border-line hover:border-rose-300 hover:text-rose-600 px-2.5 py-1.5 text-xs text-muted transition disabled:opacity-50"
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
          <div className={EMPTY}>Henüz aktif randevu hedefi oluşturulmadı.</div>
        )}
      </section>

      {jobs.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
          <SectionHead icon="📋" title="Randevu Takip & İşlem Kayıtları">
            <span className="text-xs text-muted">Son işlemler</span>
          </SectionHead>

          <div className="space-y-3">
            {jobs.slice(0, 10).map((j) => {
              const expanded = expandedJob === j.id;
              const status = JOB_STATUS[j.status] ?? { label: j.status, tone: "bg-slate-100 text-slate-700" };
              return (
                <div key={j.id} className="rounded-xl border border-line bg-paper-2 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted">{clock(j.createdAt)}</span>
                      <span className="font-bold text-ink">{j.personName || "İş"}</span>
                      {j.summary && <span className="text-muted text-[11px]">({j.summary})</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {j.dryRun && <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold">TEST</span>}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.tone}`}>{status.label}</span>
                    </div>
                  </div>

                  {j.result &&
                    (j.status === "done" ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs font-semibold text-emerald-800">🎉 {j.result}</div>
                    ) : (
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs font-semibold text-rose-800">⚠️ {j.result}</div>
                    ))}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button onClick={() => setExpandedJob(expanded ? null : j.id)} className="text-accent hover:underline font-semibold">
                      {expanded ? "▲ Logları Gizle" : `▼ Konsol Loglarını Gör (${j.log.length})`}
                    </button>
                    {isLive(j) && (
                      <button
                        onClick={() => cancelJob(j.id)}
                        disabled={busy}
                        className="text-rose-600 hover:underline font-semibold disabled:opacity-50"
                      >
                        İşlemi Durdur
                      </button>
                    )}
                  </div>

                  {expanded && j.log.length > 0 && <LogList lines={j.log} className="max-h-48" />}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

const Home = () => {
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

  if (!user || user.isAnonymous) return <SignInGate />;

  return <Dashboard user={user} />;
};

export default Home;
