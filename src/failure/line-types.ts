import type { ImmutableLine } from "../assembler/line.ts";

export interface LineWithFailures {
    "failures": ImmutableLine["failures"];
    "withFailure": ImmutableLine["withFailure"];
    "withFailures": ImmutableLine["withFailures"];
    "failed": ImmutableLine["failed"];
};
