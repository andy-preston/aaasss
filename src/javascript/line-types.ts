import type { Line } from "../line/line-types.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";

export interface LineWithRenderedJavascript extends LineWithObjectCode {
    "assemblySource": Line["assemblySource"];
};
