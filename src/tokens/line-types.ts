import type { LineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { Line } from "../line/line-types.ts";

export interface LineWithTokens extends LineWithRenderedJavascript {
    "label": Line["label"];
    "mnemonic": Line["mnemonic"];
    "symbolicOperands": Line["symbolicOperands"];
};
