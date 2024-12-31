import { LineWithObjectCode } from "../../object-code/line-types.ts";

export type FailureMessage = (line: LineWithObjectCode) => [string];
