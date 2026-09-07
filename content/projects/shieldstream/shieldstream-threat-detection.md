---
project: shieldstream
label: Threat Detection
title: Two Tiers, and the Honest Limits of Each
description: Regex signatures for known attack shapes, a training-free statistical baseline for everything else, and a measured sensitivity limit that is documented rather than quietly fixed.
order: 3
---

## Two Readers, One Stream, Zero Coupling

The alert consumer reads the identical `request_events` stream the analytics consumer already drains, from its own consumer group at its own independent offset. One `XADD` from the gateway feeds two structurally separate pipelines with no duplicated producer work and no data duplication.

Proven directly rather than assumed from the Streams documentation: with the analytics consumer stopped, twenty-five new requests pushed `analytics-cg`'s lag to twenty-five while `alert-cg` held at zero the entire time, and analytics caught up cleanly once restarted.

## Tier 1: Signature Matching

Regex-based OWASP signature detection — SQL injection (`UNION...SELECT`, `OR 1=1`, trailing-comment injection, `DROP TABLE`), cross-site scripting (`<script`, `onerror=` and `onload=` handlers, `javascript:` URIs), and path traversal including single- and double-URL-encoded variants.

This is openly the same approach a basic WAF ruleset takes, and it carries that approach's well-known limitation rather than overselling it: it catches **known literal shapes**. An attacker who obfuscates past a naive pattern — alternate encodings, splitting a keyword across a comment — gets through. That is precisely why it is paired with a structurally different second tier instead of relied on alone.

Two hardening decisions went past the obvious implementation:

**ReDoS safety.** This engine runs patterns against attacker-controlled input by design — that is the entire point of a threat detector. A pattern with nested quantifiers would therefore become a denial-of-service vector *against the detector itself*, via catastrophic backtracking on a crafted input. Every pattern is kept simple, anchored, and linear in worst-case cost — bounded repetition like `UNION.{1,40}?SELECT` rather than unbounded — and the whole rule set is tested against a 50,000-character adversarial input that must complete matching in under half a second. A signature engine that can be turned into a slow-loris attack against itself is not a security feature.

**Fields are scanned separately, not concatenated.** Gluing `query_string` and `user_agent` into one string before scanning creates a real gap: content trailing in one field defeats a `$`-anchored pattern meant for the other — specifically the SQL trailing-comment rule, which anchors to the end of its intended target and is silently neutralized by whatever follows once the fields are joined. Scanning each field independently preserves every pattern's own anchoring, and a rule fires if it matches either field on its own terms.

## Tier 2: A Baseline That Needs No Training

The second tier learns normal traffic per endpoint using an exponentially weighted moving average (α = 0.1) — operational from the first event, with no training phase and no model file. A z-score against the EWMA's own estimated standard deviation turns that into a threshold: `z > 3.0` alerts.

Severity is deliberately MEDIUM, not HIGH. A signature match is high-confidence evidence of a specific known attack shape; a statistical deviation only means *unusual*. Real traffic is bursty, closer to Poisson than smoothly normal, so this tier is a cheap interpretable heuristic rather than a rigorous statistical test — and its severity says so.

A cold-start guard suppresses scoring entirely until twenty samples have accumulated for an endpoint, because a standard deviation built from one or two points is noise, and that noise would make the very next ordinary value read as an enormous spurious spike. Verified: no alert fires during that warmup window on any endpoint, however the traffic looks.

## The Sensitivity Limit, Measured Rather Than Assumed

Against a flat baseline, a single sharp one-second spike consistently pins the z-score at approximately **3.33, regardless of how large the spike actually is** — because the outlier inflates the EWMA's own variance estimate in the very same update step that is supposed to be measuring deviation against it.

The consequence is specific and worth stating: detection reliably fires for a spike concentrated in one second, since 3.33 clears the 3.0 threshold. But **a spike that ramps up gradually across several seconds lets the moving mean chase it upward and can stay under threshold the whole way.**

Verified live rather than derived on paper: a thirty-second flat baseline around 6 requests per second, followed by a spike to 173 requests per second, scored z = 3.33 and correctly published a `BEHAVIORAL_ANOMALY` alert. The very next second, at 129 requests per second — still far above baseline — scored z = 1.86 and correctly did not re-fire, because the moving average had already started chasing the new level.

This is a genuine, mathematically explicable limitation of this specific estimator. A windowed or more robust variance calculation, or a fast/slow dual-EWMA ratio, would sharpen it. It is documented as a known limitation at this project's current scope rather than silently fixed or silently ignored.

## Deduplication, Hardened Against the Traffic It Exists to Survive

Alerts sharing a type and source within a sixty-second window collapse into one published alert carrying a running count — the same pattern Alertmanager and PagerDuty use, for the same reason: alert fatigue is worst precisely during a real sustained attack, when hundreds of scanner probes per second would otherwise drown out the signal exactly when it matters most. Verified with a burst of fifty identical SQL-injection probes: exactly one alert published, forty-nine suppressed.

One hardening decision went beyond the obvious design. The deduplication key includes a hashed source identifier that is, structurally, **attacker-controlled** — an attacker rotating their apparent source every request could grow the dedup dictionary without bound, turning the anti-noise mechanism itself into a memory-exhaustion vector. Expired entries are swept on access, time-gated to roughly every five seconds so a genuine burst doesn't pay a full sweep on every event. The statistical tier's per-endpoint baseline dictionary is bounded the same way, evicting endpoints idle for more than an hour.

## Delivery Semantics, Deliberately Inverted

This consumer's acknowledgment behaviour is the mirror image of the analytics consumer's, and the reason is tied to what each pipeline actually needs.

| | Analytics consumer | Alert consumer |
| --- | --- | --- |
| Job | Durable counting | Timely detection |
| A duplicate is | Harmless — the upsert absorbs it | Misdated noise |
| A loss is | Unacceptable | Tolerable |
| Therefore | Writes, then acknowledges. Replays its pending entries on restart | Acknowledges every message it scans, matched or not. **Drops** its pending entries on restart |
| Replicas | Many — idempotent counting is safe in parallel | **Exactly one** |

Acknowledging every scanned message, not only matches, is a deliberate correction: acknowledging only matches would let the pending-entries list grow without bound on entirely normal, non-matching traffic.

The accepted trade: missing a handful of alerts across a crash window beats double-alerting on stale detections, and a genuinely sustained attack re-triggers on the next live event anyway.

**Single replica is correctness, not simplicity.** The statistical tier's per-endpoint baseline is only meaningful if one consumer sees the entire stream. Sharding across replicas would make every replica's view of per-endpoint RPS an undercount — silently breaking the z-score math without throwing an error, just quietly producing wrong numbers.

## Fixing the Contract Before Anything Consumed It

The alert consumer publishes structured, severity-tagged JSON to a Redis Pub/Sub channel that had no subscriber at the time it was built — the dashboard didn't exist yet. Rather than wait for the consumer to exist before settling the message shape, the contract was fixed and verified live over a raw `redis-cli SUBSCRIBE`, so the shape was settled and tested before anything downstream depended on it.
