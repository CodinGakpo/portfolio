---
project: drdeepti
label: Booking
title: Why Two Patients Cannot Book the Same Slot
description: The concurrency problem at the centre of any real scheduling system, and the two independent guarantees that close it.
order: 3
---

## The Actual Hard Part

Everything else in a booking system is forms and formatting. The one genuinely hard property is this: two patients tapping the same 5:15pm slot at the same moment must not both get it.

This is not a rare edge case for a clinic. It is the *normal* case, because demand concentrates — a popular evening slot is exactly the one several people open the page for at once.

## The Race, If You Write It The Obvious Way

The intuitive implementation reads the slot, checks whether it is free, and then writes:

```
slot = TimeSlot.objects.get(id=slot_id)
if slot.is_booked:
    return error
Appointment.objects.create(slot=slot, ...)
slot.is_booked = True
slot.save()
```

Two requests can both execute the read and the check before either reaches the write. Both see an unbooked slot. Both proceed. The database happily accepts two appointments, and two patients arrive at 5:15pm to find each other in the waiting room.

Wrapping that in a transaction does not fix it. A transaction gives atomicity — all of the writes or none — but by itself it does not stop another transaction from reading the same row in between.

## The Fix

![How the booking lock works](asset:drdeepti-booking-lock)

The filter lives **inside** the locked read, which is the part that makes it work:

```python
with transaction.atomic():
    slot = (
        TimeSlot.objects
        .select_related("availability", "availability__doctor", "availability__doctor__user")
        .select_for_update()
        .get(id=slot_id, is_booked=False)
    )
    appointment = Appointment.objects.create(patient=user, slot=slot, ...)
    slot.is_booked = True
    slot.save(update_fields=["is_booked"])
```

`select_for_update()` takes a row-level write lock that Postgres holds until the transaction commits. The second request does not read stale data and then get rejected — it **blocks**, waits for the first to finish, and only then runs its own query. By that point `is_booked` is true, so `is_booked=False` matches nothing, Django raises `DoesNotExist`, and the patient gets a clean `400 Slot unavailable`.

Had the filter been applied in Python after the read, the race would be right back: both requests would successfully read the row, and both would see whatever value they happened to load.

The `select_related` chain in the same query is not decoration. The response includes the doctor's name and specialization, and without it Django would issue three extra queries per booking — while holding a write lock. Fetching them in the locked read keeps the lock held for the shortest possible time.

## The Backstop Underneath

`Appointment.slot` is a `OneToOneField(TimeSlot)`, which Django implements as a unique constraint on the column.

That means the guarantee does not rest solely on the lock. If the lock were removed, or a future code path bypassed this view entirely, a second appointment for the same slot would still be rejected — by the database, at write time, with an integrity error. One guarantee is a correctness property of the request path; the other is a property of the schema that no application code can talk its way past.

Two independent mechanisms enforcing the same invariant is the right shape for the one thing in this system that must never be wrong.

## What Is Validated, and Where

Validation happens before the lock is taken, deliberately — there is no reason to hold a row lock while deciding whether an age field parses.

| Check | Failure |
| --- | --- |
| Name present, sex selected | `400` with a specific message |
| Age parses as an integer and is greater than zero | `400 Enter a valid age` |
| Firebase ID token verifies | `400 Invalid Firebase Token` |
| Token's phone number matches the submitted number | `400 Token phone number mismatch` |
| Slot exists and is unbooked | `400 Slot unavailable` |

The patient record is created with `get_or_create` on the phone number, so a returning patient reuses their existing user rather than accumulating duplicates.

## What This Does Not Do

**A chatbot booking does not reserve a slot.** The WhatsApp flow captures a preferred date and time as free-form context and writes a lead. It never touches `TimeSlot`, never takes a lock, and cannot double-book anything — because it is not booking. Reconciling the two, so that a bot conversation can hold a real slot, is the significant open item on the roadmap.

**There is no automated test for the race.** The guarantee is enforced by Postgres and by a unique constraint rather than asserted by a suite. That is a genuinely stronger guarantee than a passing test — a test proves the code did the right thing on one run, whereas the constraint prevents the wrong thing on every run — but the honest statement is that the concurrent-booking behaviour has never been exercised by a test that fires two simultaneous requests and checks that exactly one wins.
