export type JobStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type LogLine = { at: string; level: "info" | "good" | "warn"; message: string };

export type Job = {
  id: string;
  targetId: string;
  accountId: string;
  status: JobStatus;
  dryRun: boolean;
  result?: string;
  attempts: number;
  snapshot?: string;
  log: LogLine[];
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
};

export type Target = {
  id: string;
  accountId: string;
  campus: string;
  branch: string;
  polyclinics: string[];
  targetDay: string;
  slots: string[];
  enabled: boolean;
  createdAt: string;
};

export type Account = {
  id: string;
  owner?: string;
  label: string;
  tc: string;
  phone: string;
  fatherName: string;
  birthDate: string;
  createdAt: string;
};

export type ServerInfo = {
  activeCount: number;
  runningJobs: string[];
  chrome: boolean;
  enabled: boolean;
};

export type State = {
  user: { uid: string; email: string; name: string };
  approved: boolean;
  admin: boolean;
  enabled: boolean;
  now: string;
  account?: Account | null;
  targets?: Target[];
  jobs?: Job[];
  server?: ServerInfo;
};

export type AccountInput = {
  label?: string;
  tc: string;
  phone: string;
  fatherName: string;
  birthDate: string;
};

export type TargetInput = {
  campus?: string;
  branch?: string;
  polyclinics?: string[];
  targetDay: string;
  slots?: string[];
};

export const isLive = (job: Job): boolean => job.status === "queued" || job.status === "running";
