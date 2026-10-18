import assert from "node:assert/strict";
import { test } from "node:test";

import { isLive, type Job } from "./model.ts";

test("isLive identifies queued and running jobs", () => {
  const queued: Job = {
    id: "j-1",
    targetId: "t-1",
    accountId: "a-1",
    status: "queued",
    dryRun: false,
    attempts: 0,
    log: [],
    createdAt: new Date().toISOString(),
  };
  assert.equal(isLive(queued), true);
  assert.equal(isLive({ ...queued, status: "running" }), true);
  assert.equal(isLive({ ...queued, status: "done" }), false);
  assert.equal(isLive({ ...queued, status: "failed" }), false);
  assert.equal(isLive({ ...queued, status: "cancelled" }), false);
});
