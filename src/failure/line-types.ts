import type { ImmutableLine } from "../assembler/line.ts";

export type LineWithFailures = Readonly<Pick<
    ImmutableLine, "failures" | "withFailure" | "failed"
>>;
