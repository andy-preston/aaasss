import type { ImmutableLine } from "../assembler/line-types.ts";

export interface LineWithFailures {
    "failures": ImmutableLine["failures"];
    "withFailures": ImmutableLine["withFailures"];
    "failed": ImmutableLine["failed"];
};
