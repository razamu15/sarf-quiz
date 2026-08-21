---
name: plan-review
description: Run a staged, reviewed design process before writing code — measure the codebase for ground truth, produce a dependency-ordered roadmap, then per step derive the data model from its consumers before designing entities and file structure, and implement behind a parity proof. Use when asked for an implementation plan, architecture review, refactor plan, or the design of a feature set — especially when entities, data models, services or code structure are involved.
metadata:
  argument-hint: <what to plan or review>
---

# Staged plan review

A plan is not a document you hand over. It is **four artifacts, each reviewed and
annotated before the next one starts**, and the later ones are constrained by
what the earlier ones found.

The failure this process exists to prevent: designing entities from imagination,
discovering three features later that the record can't answer a question it
needs, and paying for it as a migration instead of an edit.

## The shape

| Stage | Produces | Gate |
|---|---|---|
| **0 · Ground truth** | Measured facts about what exists | Nothing is claimed that wasn't run |
| **1 · Roadmap** | Tracks, steps, dependencies, decisions | Owner picks a step and answers the decisions |
| **2 · Deep dive** | (a) consumers → (b) entities → (c) structure | Owner signs off on the fields |
| **3 · Build** | Working code behind a parity proof | Zero diffs on what must not change |

Each stage is a reviewable artifact. If a `lavish` or artifact skill is
available, use it — annotation on the actual table beats prose in chat.

---

## Stage 0 — Ground truth by measurement

**Do not describe the system from its documentation, its comments, or your own
earlier reading. Run it.** Every number that appears in the plan must be one you
produced in this session.

- Run the test suite. Note the count; it becomes the parity baseline.
- Sweep the domain exhaustively — every entity × every variation — and count what
  produces output vs. what returns nothing. Gaps hide in the aggregate.
- **Instrument the branches.** Count how many times each code path actually
  serves a request. A path serving zero is dead code you can now prove rather
  than suspect.
- Exercise every user-facing entry point programmatically. Presets, drills,
  buttons, routes.
- Grep for exports with no importers.

Expect this to find real defects. In the session this skill came from, Stage 0
found five, including a headline feature that had been silently dead for weeks
because it **failed safe** — greyed out, no error, nobody noticed.

Report each finding with the evidence inline: the command, the counts, the
`file:line`. A finding without its evidence is an opinion.

---

## Stage 1 — The roadmap

Contents, in this order:

1. **Stock-take**, with measured numbers as the headline stats.
2. **Feature × status table** keyed to the spec's own section numbers, with a
   column for *what is actually there*. Include the features that are complete —
   the ratio is the point.
3. **A diagram of the system as it is**, marking what is solid, what is built
   with named gaps, what is oversized, and what does not exist.
4. **The one organizing decision** that shapes everything else, stated before the
   steps. (In the source session: which features get built in the prototype vs.
   natively, because building the wrong ones twice was the real cost.)
5. **Tracks, defined by file-locality.** Two tracks can run in parallel only if
   they touch different files — say which, so parallelism is a fact and not a
   hope.
6. **Steps.** Every step declares, without exception:
   - **Goal** — one sentence
   - **New entities** — name, shape, and *what it replaces*
   - **New files** — with what each one owns
   - **What it unblocks**
   - **Exit criteria** — falsifiable, not "done"
7. **Dependency graph**, naming the single-threaded blocker explicitly.
8. **Decisions** — see below.
9. **Risks**, including the step with no visible payoff (there is always one, and
   it is the one that drifts).

### Never present an entity without its consumers

The owner's words, and the reason the process worked:

> "it really helps when all of these details are accompanied by information
> regarding the feature sets that need and use these things."

Every entity names the features that use it. Every field traces to a query,
screen or rule that reads it. An entity you cannot trace to a consumer is
speculative structure — cut it or justify it as deliberate plumbing.

---

## Stage 2 — The deep dive, in three passes

**This ordering is the core of the skill.** It came from the owner and it is
non-negotiable:

> "defer implementation details for this until we come up with a concrete
> implementation of the objects and their storage. I want the queries required
> to find the weakspots and the queries that will provide the rich stats and
> history views to **inform the architectural decisions** of those objects."

### (a) Consumers first — enumerate what will be *asked*

Before designing any data model, catalogue **every query, call and read** the
consuming features will make of it. Pull them from the spec, the technical plan,
and what the code already computes. For each one record:

| # | Query | Answers (which screen / feature) | Groups or filters by | Needs on the record | Status |
|---|---|---|---|---|---|

Status is three-valued, and the middle one earns its place:

- **have** — the field exists
- **soft** — derivable, but by string surgery or **from mutable data**
  (recovering a fact by looking it up in a table that can later be corrected is
  not the same as storing it)
- **gap** — not answerable at all

Then write up the gaps as numbered **findings**, each with a resolution. The
findings are the requirements on the model. Close the catalogue explicitly
before moving on — say plainly that *a query discovered after the entity pass is
a migration, not an edit*, so this is the moment to add one.

What this reliably surfaces, and did in the source session:
- a field the dashboard needs that nothing stores
- a composed key where the consumers want its parts separately
- **data that is unrecoverable in principle** (options sampled and shuffled at
  build time — no rebuild recovers them), which settles embed-vs-copy on its own
- a capability the configuration object cannot express at all

### (b) Entities, designed against the closed list

- Every field traces to a query number or a decision. Say which, in the comment.
- **Absence is a value.** `null` means "this does not apply here" and must be
  distinguishable from a default. Never `-1` for "no index", never `Infinity`
  for "no total", never a plausible-looking stand-in for a missing fact.
- Pseudo-code **only** for the functions carrying real logic — the walk, the
  grading, the projection. Not for getters.
- Include a **"what this deletes"** section. Every removal must have been proven
  unreachable in Stage 0, not judged stale by eye. A good pass usually deletes
  more than it adds; if it doesn't, ask why.

### (c) Structure — split by the axis each concern varies on

When the file layout is questioned — and it should be — the answer is never "it
felt right". Work out **which axis each concern actually varies on**, and put the
layout on that axis:

> Building a question varies by **quiz type** → one file per type.
> The shape a question has varies by **nothing** → one file, shared.
> Deciding whether an answer is right varies by **response mode**, not type →
> its own file, keyed on mode.

Then check it against the data: *nine of the ten question kinds grade
identically*. Counting beats intuition, and it makes the boundary arguable
instead of stylistic.

Annotate the file list with **what each file owns**. A bare list of filenames is
why the boundary had to be questioned at all.

---

## Stage 3 — Build behind a parity proof

For any refactor, migration or restructure:

1. **Before touching anything**, snapshot the complete observable output of
   whatever must not change — every generated value, including the deliberate
   nulls. Write it to a file.
2. Implement.
3. Re-snapshot and **diff. It must be zero.** State the count: "zero diffs
   across 20,252 outputs" is a proof; "tests still pass" is a hope.
4. Keep the existing assertions byte-identical where they cover unchanged
   behaviour. Rewrite only the ones whose subject genuinely changed, and say
   which and why.
5. **Then walk the real application.** Drive every entry point.

Step 5 is not ceremony. In the source session, 304 green assertions did not
catch that `JSON.stringify(new Set([...]))` is `{}` — so every stored answer
would have lost its answer key and every replayed session would have shown no
correct option. It was found by exercising the running app and inspecting what
actually landed in storage. **When you find a defect in your own design, say so
plainly and fix it in the design, not around it.**

---

## Rules that hold across every stage

**Verify before asserting.** Cite the command or the `file:line`. If you cannot
show it, do not claim it.

**Surface decisions; never make consequential ones silently.** Give the real
alternatives, the cost of each, and a recommendation. Then:

- A resolved decision **moves out of the decisions section into the body** as
  settled, with its consequence spelled out. Leaving answered questions open
  makes the document rot.
- An accepted trade-off gets written into **the code** as a named comment, not
  only into the plan. The owner asked for this explicitly:

  > "so im choosing pool only and accepting an approximate drill, but i want you
  > to flag this in the comments somewhere so it is tracked that this is the
  > behaviour we have chosen."

  The comment states what was chosen, what it costs, and what revisiting it
  would take — so the next reader finds a decision rather than re-deriving it as
  a bug.

**When asked to remove something, report what genuinely needs it.** Do not
quietly keep it and do not quietly break a caller. Enumerate every call site and
say what replaces each. Some will turn out to already be dead.

**Treat pushback as a defect hunt, not a prompt to justify yourself.** When the
owner says "I don't get the point of X" or "am I missing something", there is
usually something wrong to find. Explain the boundary *and* audit it while you
explain — in the source session, answering "why are these files standalone?"
surfaced a type that had been wrongly collapsed into another.

**Scale the artifact to the stage.** Stage 1 is broad and shallow; Stage 2 is
narrow and exhaustive. Do not put field-level detail in the roadmap, and do not
hand-wave fields in the deep dive.

---

## Reviewer moves worth inviting

These are the owner's own interventions from the source session. They are the
highest-leverage moves in the process — invite them explicitly, and recognise
them when they arrive.

**Demand a chain, not a bag of types.**
> "I also dont see a question object either, which is what i naturally expect
> after seeing QuizPlan and QuizRun. to me the progression should go something
> like QuizPlan → QuizWordPool → QuizRun → Question → Answer. i think we can
> store this data better and in a more intuitive way so that when i look at the
> data its easy to follow and read."

A named chain where each object is built from its left neighbour and knows
nothing of its right one. If you cannot draw the chain, the model is a bag.

**Refuse redundant copying between entities.**
> "why are we not doing that instead of copying a bunch of fields directly which
> makes it so we have to 'reconstruct' what was asked instead of just copying
> it?"

Embedding beats copying whenever the embedded thing is already
storage-safe. Copying is only defensible as an *index*, in one function, at the
storage boundary — and then say so in that word.

**Check containment.**
> "just to confirm these objects will be contained within the comparison code
> and logic right. they will have no impact or usage in any other part of the
> code?"

Answer with the exact contact points, and the test: *delete the folder — does
the app still build?*

**Keep user-facing vocabulary out of the data.**
> "quiz plan only needs to store the data accurate types, the other side is just
> user ui which we can just have a translation function for labelling in the ui."

Store the layer the engine routes on; translate at the UI boundary, once. Mixing
the two layers in stored data is a bug generator — it is exactly what killed a
feature in the source session.

**Ask for total removal, with an escape hatch.**
> "i want to remove chartkey completely if possible. IF there is a place in the
> code that does actually need it, then flag it for me."

---

## Anti-patterns

- Presenting an entity diagram before enumerating what queries it.
- A plan whose numbers came from documentation rather than execution.
- "Phases" that are really just an ordering of everything, with no statement of
  what can run in parallel.
- Exit criteria that cannot fail.
- A refactor whose proof of correctness is that the tests still pass.
- Removing code because it looks unused.
- Leaving a resolved decision sitting in the decisions section.
- Absorbing a trade-off silently because it seemed minor.
