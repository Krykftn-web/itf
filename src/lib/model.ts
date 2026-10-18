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

export const CAMPUSES = [
  { key: "Çapa", label: "İstanbul Tıp Fakültesi (Çapa Yerleşkesi)" },
  { key: "Hasdal", label: "Hasdal Yerleşkesi" },
  { key: "", label: "Herhangi Bir Yerleşke (İlk Boş)" },
];

export type BranchItem = {
  key: string;
  name: string;
  category: "Cerrahi" | "Dahili" | "Çocuk & Ruh Sağlığı" | "Diğer";
};

export const COMMON_BRANCHES: BranchItem[] = [
  // Cerrahi Branşlar
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

  // Dahili Branşlar
  { key: "İç Hastalıkları", name: "İç Hastalıkları (Dahiliye)", category: "Dahili" },
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

  // Çocuk & Ruh Sağlığı
  { key: "Çocuk Sağlığı ve Hastalıkları", name: "Çocuk Sağlığı ve Hastalıkları (Pediatri)", category: "Çocuk & Ruh Sağlığı" },
  { key: "Çocuk Kardiyolojisi", name: "Çocuk Kardiyolojisi", category: "Çocuk & Ruh Sağlığı" },
  { key: "Çocuk ve Ergen Ruh Sağlığı", name: "Çocuk ve Ergen Ruh Sağlığı", category: "Çocuk & Ruh Sağlığı" },
  { key: "Ruh Sağlığı ve Hastalıkları", name: "Ruh Sağlığı ve Hastalıkları (Psikiyatri)", category: "Çocuk & Ruh Sağlığı" },

  // Diğer
  { key: "Radyasyon Onkolojisi", name: "Radyasyon Onkolojisi", category: "Diğer" },
  { key: "Nükleer Tıp", name: "Nükleer Tıp", category: "Diğer" },
  { key: "Radyoloji", name: "Radyoloji", category: "Diğer" },
  { key: "Tıbbi Genetik", name: "Tıbbi Genetik", category: "Diğer" },
  { key: "Sualtı Hekimliği ve Hiperbarik Tıp", name: "Sualtı Hekimliği ve Hiperbarik Tıp", category: "Diğer" },
  { key: "Spor Hekimliği", name: "Spor Hekimliği", category: "Diğer" },
  { key: "Ağız, Diş ve Çene Cerrahisi", name: "Ağız, Diş ve Çene Cerrahisi", category: "Diğer" },
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
