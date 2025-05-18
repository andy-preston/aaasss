import type { Line } from "../line/line-types.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";

export interface LineWithAddress extends LineWithRawSource {
    "address": Line["address"];
};
