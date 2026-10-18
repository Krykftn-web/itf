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
  accountId: string; // personId
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

export const SLOTS: { key: SlotKey; label: string; desc: string; hours: string }[] = [
  { key: "early", label: "Sabah Erken", desc: "07:00 – 10:00", hours: "07:00–09:59" },
  { key: "morning", label: "Öğleden Önce", desc: "10:00 – 13:00", hours: "10:00–12:59" },
  { key: "afternoon", label: "Öğleden Sonra", desc: "13:00 – 18:00", hours: "13:00–17:59" },
  { key: "any", label: "İlk Boş Saat", desc: "Farketmez", hours: "Tüm gün" },
];

export const DAYS = [
  { key: "perşembe", label: "Perşembe (Öncelikli)" },
  { key: "pazartesi", label: "Pazartesi" },
  { key: "salı", label: "Salı" },
  { key: "çarşamba", label: "Çarşamba" },
  { key: "cuma", label: "Cuma" },
  { key: "", label: "Herhangi Bir Gün (İlk Boş)" },
];

export type Target = {
  id: string;
  accountId: string; // personId
  campus: string;
  branch: string;
  polyclinics: string[];
  targetDay: string;
  slot: SlotKey | string;
  enabled: boolean;
  lastRunAt?: string;
  createdAt: string;
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
  slot?: SlotKey | string;
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
  jobs: Job[];
  server?: ServerInfo;
};

export const isLive = (job: Job): boolean => job.status === "queued" || job.status === "running";

export const stepTitle = (step?: string): string => {
  switch (step) {
    case "connect":
      return "Portala bağlanılıyor…";
    case "login":
      return "Kimlik girişi ve güvenlik kodu çözülüyor…";
    case "type":
      return "Genel Muayene seçiliyor…";
    case "campus":
      return "Çapa Yerleşkesi seçiliyor…";
    case "branch":
      return "İç Hastalıkları branşı açılıyor…";
    case "polyclinic":
      return "Dahiliye 21 poliklinik odası seçiliyor…";
    case "day":
      return "Hedef randevu günü aranıyor…";
    case "time":
      return "Saat aralığı eşleştiriliyor…";
    case "confirm":
      return "Randevu onaylama ekranı…";
    case "done":
      return "Tamamlandı";
    default:
      return "İşlem sürüyor…";
  }
};
