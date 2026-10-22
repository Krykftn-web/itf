import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addDays,
  addMonths,
  firstAppointmentDate,
  isWeekend,
  monthGrid,
  nearestWorkday,
  runDateFor,
  type Appointment,
  CAPA_EK,
  dateParts,
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
  sortAppointments,
  sortTargets,
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
  state: "pending",
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
  appointments: [],
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
  const raw: StateWire = {
    ...state(),
    people: null,
    targets: [{ ...target, polyclinics: null, state: undefined }],
    appointments: null,
    jobs: [{ ...job, log: null }],
  };
  const out = normalizeState(raw);
  assert.deepEqual(out.people, []);
  assert.deepEqual(out.targets[0]?.polyclinics, []);
  assert.equal(out.targets[0]?.state, "pending");
  assert.deepEqual(out.appointments, []);
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

test("dateParts and addDays work on plain dates", () => {
  assert.deepEqual(dateParts("2026-10-24"), { date: "24.10.2026", weekday: "Cumartesi" });
  assert.deepEqual(dateParts(""), { date: "", weekday: "" });
  assert.equal(addDays("2026-10-30", 3), "2026-11-02");
});

test("sortTargets lists open targets by date, then closed ones newest first", () => {
  const t = (id: string, date: string, s: Target["state"]): Target => ({ ...target, id, date, state: s });
  const sorted = sortTargets([t("a", "2026-10-20", "missed"), t("b", "2026-10-26", "pending"), t("c", "2026-10-24", "pending"), t("d", "2026-10-22", "done")]);
  assert.deepEqual(sorted.map((x) => x.id), ["c", "b", "d", "a"]);
});

test("sortAppointments puts upcoming visits first", () => {
  const a = (id: string, date: string): Appointment => ({
    id,
    targetId: "",
    jobId: "",
    accountId: "",
    personName: "",
    owner: "",
    branch: "",
    booking: { campus: "", branch: "", day: "", time: "10:30", date },
    bookedAt: "2026-10-01T20:01:00+03:00",
  });
  const sorted = sortAppointments([a("old", "2026-10-10"), a("late", "2026-11-05"), a("soon", "2026-10-30")], "2026-10-22");
  assert.deepEqual(sorted.map((x) => x.id), ["soon", "late", "old"]);
});

test("runDateFor counts back two working days", () => {
  assert.equal(runDateFor("2026-10-26"), "2026-10-22");
  assert.equal(runDateFor("2026-10-27"), "2026-10-23");
  assert.equal(runDateFor("2026-10-28"), "2026-10-26");
  assert.equal(firstAppointmentDate("2026-10-22T20:00:00+03:00"), "2026-10-23");
  assert.equal(firstAppointmentDate("2026-10-23T20:00:00+03:00"), "2026-10-26");
  assert.equal(nearestWorkday("2026-11-01"), "2026-11-02");
  assert.equal(isWeekend("2026-10-24"), true);
});

test("monthGrid starts on Monday", () => {
  const grid = monthGrid("2026-10-15");
  assert.equal(grid.indexOf("2026-10-01"), 3);
  assert.equal(grid.at(-1), "2026-10-31");
  assert.equal(addMonths("2026-12-20", 1), "2027-01-01");
});
