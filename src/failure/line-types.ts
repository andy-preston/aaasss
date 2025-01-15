import { Line } from "../assembler/line.ts";

export type LineWithFailures = Readonly<Pick<
    Line, "failures" | "withFailure" | "failed"
>>;
