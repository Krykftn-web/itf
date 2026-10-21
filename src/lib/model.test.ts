import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CAPA_EK,
  CAPA_MERKEZ,
  IDLE_POLL_MS,
  initials,
  isDahiliye,
  isLive,
  isValidTC,
  type Job,
  LIVE_POLL_MS,
  normalizeState,
  pollDelay,
  type State,
  type StateWire,
  stepTitle,
  suggestCampus,
  type Target,
  VATAN,
} from "./model.ts";

const job: Job = {
  id: "j-1",
  targetId: "t-1",
  accountId: "a-1",
  status: "queued",
  dryRun: false,
  attempts: 0,
  log: [],
  createdAt: new Date().toISOString(),
};

const target: Target = {
  id: "t-1",
  accountId: "a-1",
  campus: "",
  branch: "Kardiyoloji",
  polyclinics: [],
  targetDay: "",
  slot: "any",
  enabled: true,
  createdAt: "",
};

const state = (patch: Partial<State> = {}): State => ({
  user: { uid: "u-1", email: "", name: "" },
  admin: false,
  enabled: true,
  now: "",
  nextOpening: "2026-10-21T20:00:00+03:00",
  people: [],
  targets: [],
  jobs: [],
  ...patch,
});

test("isLive identifies queued and running jobs", () => {
  assert.equal(isLive(job), true);
  assert.equal(isLive({ ...job, status: "running" }), true);
  assert.equal(isLive({ ...job, status: "done" }), false);
  assert.equal(isLive({ ...job, status: "failed" }), false);
  assert.equal(isLive({ ...job, status: "cancelled" }), false);
});

test("isDahiliye folds Turkish capitals", () => {
  assert.equal(isDahiliye("İç Hastalıkları"), true);
  assert.equal(isDahiliye("İÇ HASTALIKLARI"), true);
  assert.equal(isDahiliye("Dahiliye 21"), true);
  assert.equal(isDahiliye("Kalp ve Damar Cerrahisi"), false);
  assert.equal(isDahiliye(""), false);
});

test("suggestCampus maps branches to their building", () => {
  assert.equal(suggestCampus("İç Hastalıkları"), CAPA_MERKEZ);
  assert.equal(suggestCampus("Kalp ve Damar Cerrahisi"), CAPA_EK);
  assert.equal(suggestCampus("Çocuk Cerrahisi"), CAPA_EK);
  assert.equal(suggestCampus("Çocuk Kardiyolojisi"), CAPA_MERKEZ);
  assert.equal(suggestCampus("Göz Hastalıkları"), VATAN);
  assert.equal(suggestCampus("Göğüs Hastalıkları"), "");
});

test("isValidTC checks both checksum digits", () => {
  assert.equal(isValidTC("10000000146"), true);
  assert.equal(isValidTC("12345678901"), false);
  assert.equal(isValidTC("01234567890"), false);
  assert.equal(isValidTC("1000000014"), false);
});

test("initials uses Turkish casing", () => {
  assert.equal(initials("ilker yılmaz"), "İY");
  assert.equal(initials("Mehmet"), "ME");
  assert.equal(initials("  "), "👤");
});

test("stepTitle stays generic for every branch", () => {
  assert.equal(stepTitle("branch"), "Branş açılıyor…");
  assert.equal(stepTitle(), "İşlem sürüyor…");
});

test("normalizeState turns null lists into empty ones", () => {
  const raw: StateWire = { ...state(), people: null, targets: [{ ...target, polyclinics: null }], jobs: [{ ...job, log: null }] };
  const out = normalizeState(raw);
  assert.deepEqual(out.people, []);
  assert.deepEqual(out.targets[0]?.polyclinics, []);
  assert.deepEqual(out.jobs[0]?.log, []);
});

test("pollDelay is fast near the opening or while a job runs", () => {
  const opening = Date.parse("2026-10-21T20:00:00+03:00");
  assert.equal(pollDelay(null), LIVE_POLL_MS);
  assert.equal(pollDelay(state(), opening - 60 * 60_000), IDLE_POLL_MS);
  assert.equal(pollDelay(state(), opening - 2 * 60_000), LIVE_POLL_MS);
  assert.equal(pollDelay(state(), opening + 2 * 60_000), LIVE_POLL_MS);
  assert.equal(pollDelay(state({ jobs: [job] }), opening - 60 * 60_000), LIVE_POLL_MS);
});
