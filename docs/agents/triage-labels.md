# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual status strings used in this repo's issue tracker.

Because issues live as **local markdown** files (`.scratch/<feature-slug>/...`), these strings are written as a `Status:` line near the top of each issue file rather than as GitHub labels.

| Canonical role    | String in our tracker | Meaning                                  |
| ----------------- | --------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`        | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`          | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`     | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`     | Requires human implementation            |
| `wontfix`         | `wontfix`             | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), write the corresponding string from this table into the issue's `Status:` line.

Edit the right-hand column to match whatever vocabulary you actually use.
