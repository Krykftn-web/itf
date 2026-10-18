import { createClient, type KrykftnClient } from "@krykftn/client";

import type { Account, AccountInput, Job, State, Target, TargetInput } from "@/lib/model.ts";

export const API_BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.krykftn.dev";

export const PROJECT: string = process.env.NEXT_PUBLIC_PROJECT ?? "itf";

export const SITE_URL: string = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itf.krykftn.dev";

export const kf: KrykftnClient = createClient({ project: PROJECT, baseUrl: API_BASE });

type Method = "GET" | "POST" | "PUT" | "DELETE";

const call = <T>(method: Method, path: string[], body?: unknown): Promise<T> =>
  kf.transport.request<T>({ method, segments: ["v1", "app", ...path], body });

export const api = {
  me: () => call<State>("GET", ["me"]),
  saveAccount: (input: AccountInput) => call<Account>("PUT", ["account"], input),
  dropAccount: () => call<void>("DELETE", ["account"]),
  addTarget: (input: TargetInput) => call<Target>("POST", ["targets"], input),
  removeTarget: (id: string) => call<void>("DELETE", ["targets", id]),
  runTarget: (id: string, dryRun: boolean) => call<Job>("POST", ["targets", id, "run"], { dryRun }),
  job: (id: string) => call<Job>("GET", ["jobs", id]),
  cancelJob: (id: string) => call<{ cancelled: boolean }>("POST", ["jobs", id, "cancel"]),
  setEnabled: (enabled: boolean) => call<void>("POST", ["enabled"], { enabled }),
};
