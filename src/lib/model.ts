export type JobStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type LogLine = {
  at: string;
  level: "info" | "good" | "warn";
  message: string;
  count?: number;
};

export type Job = {
  id: string;
  targetId: string;
  accountId: string;
  personName?: string;
  owner?: string;
  summary?: string;
  trigger?: "manual" | "schedule";
  status: JobStatus;
  step?: string;
  dryRun: boolean;
  attempts?: number;
  result?: string;
  snapshot?: string;
  hasSnapshot?: boolean;
  log: LogLine[];
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
};

export type SlotKey = "early" | "morning" | "afternoon" | "any";

export const SLOTS: { key: SlotKey; label: string; desc: string }[] = [
  { key: "early", label: "Sabah Erken", desc: "07:00 – 10:00" },
  { key: "morning", label: "Öğleden Önce", desc: "10:00 – 13:00" },
  { key: "afternoon", label: "Öğleden Sonra", desc: "13:00 – 18:00" },
  { key: "any", label: "İlk Boş Saat", desc: "Farketmez" },
];

export const DAYS = [
  { key: "", label: "Farketmez" },
  { key: "pazartesi", label: "Pazartesi" },
  { key: "salı", label: "Salı" },
  { key: "çarşamba", label: "Çarşamba" },
  { key: "perşembe", label: "Perşembe" },
  { key: "cuma", label: "Cuma" },
];

export const RELATIONS = ["Babam", "Kendim", "Annem", "Eşim", "Diğer"] as const;

export const CAPA_MERKEZ = "Çapa Yerleşkesi - Merkez Kampüs";
export const CAPA_EK = "Çapa Yerleşkesi - Ek Poliklinik Binası";
export const VATAN = "Vatan Yerleşkesi";
export const DEFAULT_BRANCH = "İç Hastalıkları";
export const DEFAULT_ROOM = "Dahiliye 21";
export const CUSTOM = "custom";

export type CampusItem = {
  key: string;
  name: string;
  desc: string;
};

export const CAMPUSES: CampusItem[] = [
  { key: CAPA_MERKEZ, name: CAPA_MERKEZ, desc: "Dahiliye, Kardiyoloji, Nöroloji, Göğüs, Çocuk vb." },
  { key: CAPA_EK, name: CAPA_EK, desc: "Kalp ve Damar Cerrahisi, Ortopedi, Genel Cerrahi, Psikiyatri vb." },
  { key: "Beyazıt Yerleşkesi", name: "Beyazıt Yerleşkesi", desc: "Aile Hekimliği, FTR, Cildiye, KBB, Dahiliye vb." },
  { key: "Esenyurt Yerleşkesi", name: "Esenyurt Yerleşkesi", desc: "Genel Cerrahi, Ortopedi, Göğüs, Nöroloji, Dahiliye vb." },
  { key: VATAN, name: VATAN, desc: "Göz Hastalıkları, KBB" },
  { key: "", name: "Herhangi Bir Yerleşke (İlk Boş)", desc: "İlk açık yerleşkeden randevu alır" },
];

export type BranchCategory = "Cerrahi" | "Dahili" | "Çocuk & Ruh Sağlığı" | "Diğer";

export type BranchItem = {
  key: string;
  name: string;
  category: BranchCategory;
};

export const BRANCH_GROUPS: { category: BranchCategory; label: string }[] = [
  { category: "Cerrahi", label: "── Cerrahi Branşlar ──" },
  { category: "Dahili", label: "── Dahili Branşlar ──" },
  { category: "Çocuk & Ruh Sağlığı", label: "── Çocuk & Ruh Sağlığı ──" },
  { category: "Diğer", label: "── Tanı & Diğer Branşlar ──" },
];

export const COMMON_BRANCHES: BranchItem[] = [
  { key: "Kalp ve Damar Cerrahisi", name: "Kalp ve Damar Cerrahisi", category: "Cerrahi" },
  { key: "Genel Cerrahi", name: "Genel Cerrahi", category: "Cerrahi" },
  { key: "Beyin ve Sinir Cerrahisi", name: "Beyin ve Sinir Cerrahisi (Nöroşirürji)", category: "Cerrahi" },
  { key: "Ortopedi ve Travmatoloji", name: "Ortopedi ve Travmatoloji", category: "Cerrahi" },
  { key: "Göz Hastalıkları", name: "Göz Hastalıkları", category: "Cerrahi" },
  { key: "Kulak Burun Boğaz Hastalıkları", name: "Kulak Burun Boğaz Hastalıkları (KBB)", category: "Cerrahi" },
  { key: "Üroloji", name: "Üroloji", category: "Cerrahi" },
  { key: "Göğüs Cerrahisi", name: "Göğüs Cerrahisi", category: "Cerrahi" },
  { key: "Plastik, Rekonstrüktif ve Estetik Cerrahi", name: "Plastik, Rekonstrüktif ve Estetik Cerrahi", category: "Cerrahi" },
  { key: "Çocuk Cerrahisi", name: "Çocuk Cerrahisi", category: "Cerrahi" },
  { key: "Kadın Hastalıkları ve Doğum", name: "Kadın Hastalıkları ve Doğum", category: "Cerrahi" },

  { key: DEFAULT_BRANCH, name: "İç Hastalıkları (Dahiliye)", category: "Dahili" },
  { key: "Kardiyoloji", name: "Kardiyoloji (Kalp Hastalıkları)", category: "Dahili" },
  { key: "Nöroloji", name: "Nöroloji (Beyin & Sinir Hastalıkları)", category: "Dahili" },
  { key: "Göğüs Hastalıkları", name: "Göğüs Hastalıkları", category: "Dahili" },
  { key: "Gastroenteroloji", name: "Gastroenteroloji (Mide & Bağırsak)", category: "Dahili" },
  { key: "Endokrinoloji ve Metabolizma Hastalıkları", name: "Endokrinoloji ve Metabolizma (Diyabet)", category: "Dahili" },
  { key: "Nefroloji", name: "Nefroloji (Böbrek Hastalıkları)", category: "Dahili" },
  { key: "Romatoloji", name: "Romatoloji", category: "Dahili" },
  { key: "Hematoloji", name: "Hematoloji (Kan Hastalıkları)", category: "Dahili" },
  { key: "Tıbbi Onkoloji", name: "Tıbbi Onkoloji (Kanser)", category: "Dahili" },
  { key: "Enfeksiyon Hastalıkları", name: "Enfeksiyon Hastalıkları ve Klinik Mikrobiyoloji", category: "Dahili" },
  { key: "Deri ve Zührevi Hastalıklar", name: "Deri ve Zührevi Hastalıklar (Cildiye)", category: "Dahili" },
  { key: "Fiziksel Tıp ve Rehabilitasyon", name: "Fiziksel Tıp ve Rehabilitasyon (FTR)", category: "Dahili" },
  { key: "İmmünoloji ve Alerji Hastalıkları", name: "İmmünoloji ve Alerji Hastalıkları", category: "Dahili" },
  { key: "Geriatri", name: "Geriatri (Yaşlı Sağlığı)", category: "Dahili" },
  { key: "Algoloji", name: "Algoloji (Ağrı Polikliniği)", category: "Dahili" },

  { key: "Çocuk Sağlığı ve Hastalıkları", name: "Çocuk Sağlığı ve Hastalıkları (Pediatri)", category: "Çocuk & Ruh Sağlığı" },
  { key: "Çocuk Kardiyolojisi", name: "Çocuk Kardiyolojisi", category: "Çocuk & Ruh Sağlığı" },
  { key: "Çocuk ve Ergen Ruh Sağlığı", name: "Çocuk ve Ergen Ruh Sağlığı", category: "Çocuk & Ruh Sağlığı" },
  { key: "Ruh Sağlığı ve Hastalıkları", name: "Ruh Sağlığı ve Hastalıkları (Psikiyatri)", category: "Çocuk & Ruh Sağlığı" },

  { key: "Radyasyon Onkolojisi", name: "Radyasyon Onkolojisi", category: "Diğer" },
  { key: "Nükleer Tıp", name: "Nükleer Tıp", category: "Diğer" },
  { key: "Radyoloji", name: "Radyoloji", category: "Diğer" },
  { key: "Tıbbi Genetik", name: "Tıbbi Genetik", category: "Diğer" },
  { key: "Sualtı Hekimliği ve Hiperbarik Tıp", name: "Sualtı Hekimliği ve Hiperbarik Tıp", category: "Diğer" },
  { key: "Spor Hekimliği", name: "Spor Hekimliği", category: "Diğer" },
  { key: "Ağız, Diş ve Çene Cerrahisi", name: "Ağız, Diş ve Çene Cerrahisi", category: "Diğer" },
];

export type TargetState = "pending" | "running" | "done" | "missed" | "blocked";

export type Target = {
  id: string;
  accountId: string;
  campus: string;
  branch: string;
  polyclinics: string[];
  targetDay: string;
  date?: string;
  slot: SlotKey;
  enabled: boolean;
  done?: boolean;
  doneAt?: string;
  appointmentId?: string;
  state: TargetState;
  waitUntil?: string;
  lastRunAt?: string;
  createdAt: string;
};

export type Booking = {
  campus: string;
  branch: string;
  polyclinic?: string;
  day: string;
  time: string;
  date?: string;
};

export type Appointment = {
  id: string;
  targetId: string;
  jobId: string;
  accountId: string;
  personName: string;
  owner: string;
  branch: string;
  booking: Booking;
  bookedAt: string;
};

export type PersonView = {
  id: string;
  owner: string;
  name: string;
  relation?: string;
  maskedTc: string;
  maskedPhone: string;
  createdAt: string;
};

export type PersonInput = {
  name: string;
  relation?: string;
  tc: string;
  phone: string;
  fatherName: string;
  birthDate: string;
};

export type TargetInput = {
  personId: string;
  campus?: string;
  branch?: string;
  polyclinics?: string[];
  targetDay: string;
  date: string;
  slot?: SlotKey;
};

export type ServerInfo = {
  activeCount: number;
  waitingCount: number;
  chrome: boolean;
  enabled: boolean;
};

export type State = {
  user: { uid: string; email: string; name: string };
  admin: boolean;
  enabled: boolean;
  now: string;
  nextOpening: string;
  people: PersonView[];
  targets: Target[];
  appointments: Appointment[];
  jobs: Job[];
  server?: ServerInfo;
};

export type StateWire = Omit<State, "people" | "targets" | "appointments" | "jobs"> & {
  people: PersonView[] | null;
  targets: (Omit<Target, "polyclinics" | "state"> & { polyclinics: string[] | null; state?: TargetState })[] | null;
  appointments?: Appointment[] | null;
  jobs: (Omit<Job, "log"> & { log: LogLine[] | null })[] | null;
};

export const normalizeState = (raw: StateWire): State => ({
  ...raw,
  people: raw.people ?? [],
  targets: (raw.targets ?? []).map((t) => ({ ...t, polyclinics: t.polyclinics ?? [], state: t.state ?? "pending" })),
  appointments: raw.appointments ?? [],
  jobs: (raw.jobs ?? []).map((j) => ({ ...j, log: j.log ?? [] })),
});

const DAY_MS = 86_400_000;
const NUMERIC_DATE = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const WEEKDAY = new Intl.DateTimeFormat("tr-TR", { weekday: "long", timeZone: "UTC" });

const utcNoon = (iso: string): Date => new Date(`${iso.slice(0, 10)}T12:00:00Z`);

export const addDays = (iso: string, days: number): string => new Date(utcNoon(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);

export const dateParts = (iso = ""): { date: string; weekday: string } => {
  const d = utcNoon(iso);
  return Number.isNaN(d.getTime()) ? { date: iso, weekday: "" } : { date: NUMERIC_DATE.format(d), weekday: WEEKDAY.format(d) };
};

const isOpen = (t: Target): boolean => t.state === "pending" || t.state === "running";

export const sortTargets = (targets: Target[]): Target[] =>
  [...targets].sort((a, b) => {
    const order = Number(isOpen(b)) - Number(isOpen(a));
    if (order !== 0) return order;
    const byDate = (a.date ?? "").localeCompare(b.date ?? "");
    return isOpen(a) ? byDate : -byDate;
  });

export const appointmentDate = (a: Appointment): string => a.booking.date || a.bookedAt.slice(0, 10);

export const sortAppointments = (list: Appointment[], today: string): Appointment[] =>
  [...list].sort((a, b) => {
    const [da, db] = [appointmentDate(a), appointmentDate(b)];
    const order = Number(db >= today) - Number(da >= today);
    if (order !== 0) return order;
    return da >= today ? da.localeCompare(db) : db.localeCompare(da);
  });

export const isLive = (job: Job): boolean => job.status === "queued" || job.status === "running";

const STEP_TITLES: Record<string, string> = {
  connect: "Portala bağlanılıyor…",
  login: "Kimlik girişi ve güvenlik kodu çözülüyor…",
  type: "Genel Muayene seçiliyor…",
  campus: "Yerleşke seçiliyor…",
  branch: "Branş açılıyor…",
  polyclinic: "Poliklinik odası seçiliyor…",
  day: "Hedef randevu günü aranıyor…",
  time: "Saat aralığı eşleştiriliyor…",
  confirm: "Randevu onaylama ekranı…",
  done: "Tamamlandı",
};

export const stepTitle = (step = ""): string => STEP_TITLES[step] ?? "İşlem sürüyor…";

const TR_ASCII: Record<string, string> = { ı: "i", ş: "s", ç: "c", ğ: "g", ö: "o", ü: "u" };

export const fold = (s = ""): string => s.toLocaleLowerCase("tr").replace(/[ışçğöü]/g, (c) => TR_ASCII[c] ?? c);

export const isDahiliye = (branch = ""): boolean => {
  const b = fold(branch);
  return b.includes("ic hastalik") || b.includes("dahiliye");
};

const CAMPUS_HINTS: [string, string[]][] = [
  [CAPA_EK, ["kalp", "ortopedi", "genel cerrahi", "plastik", "psikiyatri", "cocuk cerrahisi"]],
  [VATAN, ["goz"]],
  [CAPA_MERKEZ, ["ic hastalik", "dahiliye", "kardiyo", "noroloji", "cocuk"]],
];

export const suggestCampus = (branch: string): string => {
  const b = fold(branch);
  return CAMPUS_HINTS.find(([, words]) => words.some((w) => b.includes(w)))?.[0] ?? "";
};

export const isValidTC = (tc: string): boolean => {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const d = [...tc].map(Number);
  const at = (i: number) => d[i] ?? 0;
  const odd = at(0) + at(2) + at(4) + at(6) + at(8);
  const even = at(1) + at(3) + at(5) + at(7);
  const sum = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return (((odd * 7 - even) % 10) + 10) % 10 === at(9) && sum % 10 === at(10);
};

export const initials = (name: string): string => {
  const [first = "", second = ""] = name.trim().split(/\s+/);
  return (second ? first.charAt(0) + second.charAt(0) : first.slice(0, 2)).toLocaleUpperCase("tr") || "👤";
};

export const LIVE_POLL_MS = 3000;
export const IDLE_POLL_MS = 15000;
const OPENING_WATCH_MS = 5 * 60_000;

export const pollDelay = (state: State | null, now = Date.now()): number =>
  !state || state.jobs.some(isLive) || Date.parse(state.nextOpening) - now < OPENING_WATCH_MS ? LIVE_POLL_MS : IDLE_POLL_MS;
