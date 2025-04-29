import type { ImmutableLine } from "../assembler/line.ts";

export interface LineWithFailures {
    "failures": ImmutableLine["failures"];
    "withFailures": ImmutableLine["withFailures"];
    "failed": ImmutableLine["failed"];
};
