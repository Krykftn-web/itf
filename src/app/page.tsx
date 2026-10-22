"use client";

import type { User } from "@krykftn/client";
import { useAuth } from "@krykftn/client/react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { api, kf } from "@/lib/kf.ts";
import {
  addDays,
  type Appointment,
  appointmentDate,
  BRANCH_GROUPS,
  CAMPUSES,
  CAPA_MERKEZ,
  COMMON_BRANCHES,
  CUSTOM,
  dateParts,
  DAYS,
  DEFAULT_BRANCH,
  DEFAULT_ROOM,
  initials,
  isDahiliye,
  isLive,
  isValidTC,
  type Job,
  type JobStatus,
  type LogLine,
  type PersonInput,
  type PersonView,
  pollDelay,
  RELATIONS,
  type SlotKey,
  SLOTS,
  sortAppointments,
  sortTargets,
  type State,
  stepTitle,
  suggestCampus,
  type Target,
  type TargetInput,
  type TargetState,
} from "@/lib/model.ts";

const FIELD = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
const PRIMARY =
  "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50";
const LINK = "text-xs font-semibold hover:underline disabled:opacity-50";
const CARD = "rounded-2xl border border-line bg-paper p-5";

const CLOCK = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const STAMP = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const clock = (iso: string): string => CLOCK.format(new Date(iso));

const stamp = (iso: string): string => STAMP.format(new Date(iso));

const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const LOG_TONE: Record<LogLine["level"], string> = {
  info: "",
  good: "text-emerald-400",
  warn: "text-rose-400",
};

const JOB_STATUS: Record<JobStatus, string> = {
  queued: "Sırada",
  running: "Çalışıyor",
  done: "Bitti",
  failed: "Başarısız",
  cancelled: "Durduruldu",
};

const TARGET_STATUS: Record<TargetState, { label: string; tone: string }> = {
  pending: { label: "Bekliyor", tone: "bg-sky-100 text-sky-800" },
  running: { label: "Çalışıyor", tone: "bg-blue-600 text-white animate-pulse" },
  done: { label: "Alındı", tone: "bg-emerald-100 text-emerald-800" },
  missed: { label: "Alınamadı", tone: "bg-slate-200 text-slate-600" },
  blocked: { label: "10 gün kuralı", tone: "bg-amber-100 text-amber-800" },
};

const BRANCH_OPTIONS = BRANCH_GROUPS.map((g) => ({ ...g, items: COMMON_BRANCHES.filter((b) => b.category === g.category) }));

const slotLabel = (key: string): string => SLOTS.find((s) => s.key === key)?.label ?? "";

const dayLabel = (key: string): string => DAYS.find((d) => d.key === key)?.label ?? "";

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
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <div className={`${CARD} p-8 text-center`}>
        <h1 className="text-2xl font-bold text-ink">İTF Randevu</h1>
        <p className="mt-2 text-sm text-muted">Kurduğunuz tarihte saat 20:00&apos;de randevuyu sizin için alır.</p>
        <button
          onClick={() => void handleSignIn()}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-70"
        >
          <IconGoogle />
          <span>{busy ? "Yönlendiriliyor…" : "Google ile giriş yap"}</span>
        </button>
        {error && <p className="mt-3 text-xs font-medium text-hospital">{error}</p>}
      </div>
    </div>
  );
};

const NextOpening = ({ at }: { at: string }) => {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse(at);
    const update = () => setLeft(Math.max(0, target - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [at]);

  if (left === null) return null;
  const urgent = left < 10 * 60_000;
  const hours = Math.floor(left / 3_600_000);
  const minutes = Math.floor(left / 60_000) % 60;
  const seconds = Math.floor(left / 1000) % 60;
  const text = left === 0 ? "şimdi" : hours > 0 ? `${hours} sa ${minutes} dk sonra` : `${minutes} dk ${seconds} sn sonra`;

  return (
    <p className={`rounded-xl px-4 py-2.5 text-sm ${urgent ? "bg-red-50 text-red-700" : "bg-paper-2 text-ink-soft"}`}>
      Sonraki açılış <strong>{dateParts(at).date} 20:00</strong> · {text}
    </p>
  );
};

const LogList = ({ lines }: { lines: LogLine[] }) => (
  <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200">
    {lines.map((l, idx) => (
      <div key={idx}>
        <span className="mr-2 text-slate-500">{clock(l.at)}</span>
        <span className={LOG_TONE[l.level]}>{l.message}</span>
        {(l.count ?? 0) > 1 && <span className="ml-1.5 text-slate-500">×{l.count}</span>}
      </div>
    ))}
  </div>
);

const Section = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <section className={CARD}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
    {children}
  </label>
);

const DateBadge = ({ iso }: { iso?: string }) => {
  const { date, weekday } = dateParts(iso);
  return (
    <div className="w-14 shrink-0 text-center">
      <div className="text-sm font-bold text-ink">{iso ? date.slice(0, 5) : "—"}</div>
      <div className="text-[11px] text-muted">{weekday}</div>
    </div>
  );
};

const AppointmentCard = ({ appt, past }: { appt: Appointment; past: boolean }) => {
  const b = appt.booking;
  const { date, weekday } = dateParts(appointmentDate(appt));
  return (
    <div className={`rounded-xl border p-4 ${past ? "border-line bg-paper-2 opacity-60" : "border-emerald-300 bg-emerald-50"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-lg font-bold text-ink">
          {b.date ? `${date} ${weekday}` : b.day} · {b.time}
        </div>
        <span className="text-xs text-muted">{stamp(appt.bookedAt)} alındı</span>
      </div>
      <div className="mt-1 text-sm text-ink-soft">
        {appt.personName} · {b.branch || appt.branch}
        {b.polyclinic && ` · ${b.polyclinic}`}
      </div>
      {b.campus && <div className="text-xs text-muted">{b.campus}</div>}
    </div>
  );
};

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
    <form onSubmit={submit} className="mb-4 space-y-3 rounded-xl bg-paper-2 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Ad soyad">
          <input type="text" required value={form.name} onChange={(e) => update({ name: e.target.value })} className={FIELD} />
        </Field>
        <Field label="Yakınlık">
          <select value={form.relation} onChange={(e) => update({ relation: e.target.value })} className={FIELD}>
            {RELATIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label={form.tc.length === 11 && !tcValid ? "T.C. kimlik no · hatalı" : "T.C. kimlik no"}>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={11}
            value={form.tc}
            onChange={(e) => update({ tc: e.target.value.replace(/\D/g, "") })}
            className={`${FIELD} font-mono ${form.tc.length === 11 && !tcValid ? "border-rose-400" : ""}`}
          />
        </Field>
        <Field label="Cep telefonu">
          <input type="tel" required placeholder="05XX…" value={form.phone} onChange={(e) => update({ phone: e.target.value })} className={FIELD} />
        </Field>
        <Field label="Baba adı">
          <input type="text" required value={form.fatherName} onChange={(e) => update({ fatherName: e.target.value })} className={FIELD} />
        </Field>
        <Field label="Doğum tarihi">
          <input
            type="text"
            required
            placeholder="GG.AA.YYYY"
            value={form.birthDate}
            onChange={(e) => update({ birthDate: e.target.value })}
            className={FIELD}
          />
        </Field>
      </div>
      <button type="submit" disabled={busy || !tcValid} className={PRIMARY}>
        Kaydet
      </button>
    </form>
  );
};

type TargetFormProps = {
  people: PersonView[];
  personId: string;
  onPersonChange: (id: string) => void;
  firstDate: string;
  busy: boolean;
  onSave: (input: TargetInput) => void;
};

const TargetForm = ({ people, personId, onPersonChange, firstDate, busy, onSave }: TargetFormProps) => {
  const [date, setDate] = useState(firstDate);
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
    if (personId && branchName)
      onSave({
        personId,
        date,
        campus: campus.trim(),
        branch: branchName,
        polyclinics: dahiliye && roomName ? [roomName] : [],
        targetDay: day,
        slot,
      });
  };

  return (
    <form onSubmit={submit} className="mb-4 space-y-3 rounded-xl bg-paper-2 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Kişi">
          <select value={personId} onChange={(e) => onPersonChange(e.target.value)} className={FIELD}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tarih (o gün 20:00'de bir kez çalışır)">
          <input
            type="date"
            required
            min={firstDate}
            max={addDays(firstDate, 90)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD}
          />
        </Field>
        <Field label="Branş">
          <select value={branch} onChange={(e) => pickBranch(e.target.value)} className={FIELD}>
            {BRANCH_OPTIONS.map((g) => (
              <optgroup key={g.category} label={g.category}>
                {g.items.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM}>Listede yok, yazacağım</option>
          </select>
        </Field>
        {branch === CUSTOM && (
          <Field label="Branş adı">
            <input type="text" required value={customBranch} onChange={(e) => setCustomBranch(e.target.value)} className={FIELD} />
          </Field>
        )}
        {dahiliye && (
          <Field label="Poliklinik odası">
            <select value={room} onChange={(e) => setRoom(e.target.value)} className={FIELD}>
              <option value={DEFAULT_ROOM}>{DEFAULT_ROOM}</option>
              <option value="Dahiliye">Herhangi bir Dahiliye odası</option>
              <option value={CUSTOM}>Başka oda yazacağım</option>
            </select>
          </Field>
        )}
        {dahiliye && room === CUSTOM && (
          <Field label="Oda adı">
            <input
              type="text"
              required
              placeholder="Örn. Dahiliye 5"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              className={FIELD}
            />
          </Field>
        )}
        <Field label="Yerleşke">
          <select value={campus} onChange={(e) => setCampus(e.target.value)} className={FIELD}>
            {CAMPUSES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.key ? c.name : "Farketmez"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Randevu günü">
          <select value={day} onChange={(e) => setDay(e.target.value)} className={FIELD}>
            {DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Saat">
          <select value={slot} onChange={(e) => setSlot(e.target.value as SlotKey)} className={FIELD}>
            {SLOTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({s.desc})
              </option>
            ))}
          </select>
        </Field>
      </div>
      <button type="submit" disabled={busy} className={PRIMARY}>
        Hedefi kaydet
      </button>
    </form>
  );
};

const TargetRow = ({
  target,
  person,
  job,
  today,
  busy,
  onTest,
  onStop,
  onDelete,
}: {
  target: Target;
  person?: PersonView;
  job?: Job;
  today: string;
  busy: boolean;
  onTest: () => void;
  onStop: (jobId: string) => void;
  onDelete: () => void;
}) => {
  const status =
    target.state === "pending" && target.date === today ? { label: "Bu akşam 20:00", tone: "bg-accent text-white" } : TARGET_STATUS[target.state];
  const closed = target.state === "done" || target.state === "missed" || target.state === "blocked";
  const details = [
    target.polyclinics.join(", "),
    target.campus || "Yerleşke farketmez",
    `Gün: ${dayLabel(target.targetDay)}`,
    slotLabel(target.slot),
  ].filter(Boolean);

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${closed ? "border-line bg-paper-2 opacity-60" : "border-line bg-white"}`}>
      <DateBadge iso={target.date} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-ink">
            {person?.name ?? "Silinmiş kişi"} · {target.branch}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
        </div>
        <div className="text-xs text-muted">{details.join(" · ")}</div>
        {target.state === "blocked" && target.waitUntil && (
          <div className="text-xs text-amber-700">Son randevudan 10 gün geçmeden çalışmaz ({stamp(target.waitUntil)})</div>
        )}
        {job && <div className="text-xs text-accent">{stepTitle(job.step)}</div>}
        <div className="mt-1.5 flex gap-4">
          {job && (
            <button onClick={() => onStop(job.id)} disabled={busy} className={`${LINK} text-rose-600`}>
              Durdur
            </button>
          )}
          {target.state === "pending" && !job && (
            <button onClick={onTest} disabled={busy} className={`${LINK} text-accent`} title="Randevu almadan son adıma kadar dener">
              Test et
            </button>
          )}
          {!job && (
            <button onClick={onDelete} disabled={busy} className={`${LINK} text-muted`}>
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
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

  const act = async (task: () => Promise<unknown>, onDone?: () => void) => {
    setBusy(true);
    try {
      await task();
      onDone?.();
      await reload();
    } catch (err: unknown) {
      alert(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const deletePerson = (person: PersonView) => {
    if (confirm(`${person.name} ve hedefleri silinsin mi?`)) void act(() => api.deletePerson(person.id));
  };

  const people = state?.people ?? [];
  const targets = sortTargets(state?.targets ?? []);
  const jobs = state?.jobs ?? [];
  const today = state?.now.slice(0, 10) ?? "";
  const appointments = sortAppointments(state?.appointments ?? [], today);
  const firstDate = state?.nextOpening.slice(0, 10) ?? today;
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const liveByTarget = new Map(jobs.filter(isLive).map((j) => [j.targetId, j]));
  const personId = peopleById.has(chosenPerson) ? chosenPerson : (people[0]?.id ?? "");

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">İTF Randevu</h1>
        <div className="flex items-center gap-3 text-xs">
          <span className="max-w-[160px] truncate text-muted sm:max-w-none">{user.email || user.displayName}</span>
          <button onClick={() => void kf.auth.signOut()} className="font-semibold text-hospital hover:underline">
            Çıkış
          </button>
        </div>
      </header>

      {state?.nextOpening && <NextOpening at={state.nextOpening} />}

      {error && <div className="rounded-xl border border-hospital/30 bg-hospital-soft p-3 text-sm text-hospital">{error}</div>}

      {appointments.length > 0 && (
        <Section title="Alınan randevular">
          <div className="space-y-2">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appt={a} past={appointmentDate(a) < today} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Hedefler"
        action={
          people.length > 0 && (
            <button onClick={() => setTargetFormOpen(!targetFormOpen)} className={PRIMARY}>
              {targetFormOpen ? "Vazgeç" : "Yeni hedef"}
            </button>
          )
        }
      >
        {targetFormOpen && people.length > 0 && (
          <TargetForm
            people={people}
            personId={personId}
            onPersonChange={setChosenPerson}
            firstDate={firstDate}
            busy={busy}
            onSave={(input) => void act(() => api.addTarget(input), () => setTargetFormOpen(false))}
          />
        )}

        {people.length === 0 ? (
          <p className="text-sm text-muted">Önce aşağıdan bir kişi ekleyin.</p>
        ) : targets.length === 0 ? (
          <p className="text-sm text-muted">Henüz hedef yok. Tarih ve branş seçip bir hedef kurun.</p>
        ) : (
          <div className="space-y-2">
            {targets.map((t) => (
              <TargetRow
                key={t.id}
                target={t}
                person={peopleById.get(t.accountId)}
                job={liveByTarget.get(t.id)}
                today={today}
                busy={busy}
                onTest={() => void act(() => api.runTarget(t.id, true))}
                onStop={(jobId) => void act(() => api.cancelJob(jobId))}
                onDelete={() => void act(() => api.removeTarget(t.id))}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Kişiler"
        action={
          <button onClick={() => setPersonFormOpen(!personFormOpen)} className={PRIMARY}>
            {personFormOpen ? "Vazgeç" : "Yeni kişi"}
          </button>
        }
      >
        {personFormOpen && <PersonForm busy={busy} onSave={(input) => void act(() => api.addPerson(input), () => setPersonFormOpen(false))} />}

        {people.length === 0 ? (
          <p className="text-sm text-muted">Randevu alınacak kişiyi ekleyin.</p>
        ) : (
          <div className="space-y-2">
            {people.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent">
                  {initials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">
                    {p.name} <span className="font-normal text-muted">· {p.relation || "Kişi"}</span>
                  </div>
                  <div className="font-mono text-xs text-muted">{p.maskedTc}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setChosenPerson(p.id);
                      setTargetFormOpen(true);
                    }}
                    className={`${LINK} text-accent`}
                  >
                    Hedef kur
                  </button>
                  <button onClick={() => deletePerson(p)} disabled={busy} className={`${LINK} text-muted`}>
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {jobs.length > 0 && (
        <details className={CARD}>
          <summary className="cursor-pointer text-sm font-semibold text-ink-soft">İşlem geçmişi</summary>
          <div className="mt-3 space-y-2">
            {jobs.slice(0, 10).map((j) => (
              <details key={j.id} className="rounded-xl border border-line p-3 text-xs">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-muted">{stamp(j.createdAt)}</span>
                  <span className="font-semibold text-ink">{j.personName}</span>
                  <span className="text-muted">{j.summary}</span>
                  {j.dryRun && <span className="rounded bg-amber-100 px-1.5 text-amber-800">test</span>}
                  <span className="ml-auto font-semibold">{JOB_STATUS[j.status] ?? j.status}</span>
                </summary>
                {j.result && <p className="mt-2 text-ink-soft">{j.result}</p>}
                {j.log.length > 0 && <LogList lines={j.log} />}
              </details>
            ))}
          </div>
        </details>
      )}
    </main>
  );
};

const Home = () => {
  const { user, loading } = useAuth(kf);

  if (loading && !user)
    return (
      <div className="grid min-h-dvh place-items-center bg-ground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );

  if (!user || user.isAnonymous) return <SignInGate />;

  return <Dashboard user={user} />;
};

export default Home;
