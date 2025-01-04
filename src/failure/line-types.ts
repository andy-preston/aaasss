import { Line } from "../pipeline/line.ts";

export type LineWithFailures = Readonly<
    Pick<Line, "failures" | "addFailures" | "failed">
>;
