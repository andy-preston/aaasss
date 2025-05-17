import type { ImmutableLine } from "../line/line-types.ts";

export interface LineWithFailures {
    "failures": ImmutableLine["failures"];
    "withFailures": ImmutableLine["withFailures"];
    "failed": ImmutableLine["failed"];
};
