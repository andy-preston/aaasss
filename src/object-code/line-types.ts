import type { ImmutableLine } from "../line/line-types.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";

export interface LineWithObjectCode extends LineWithAddress {
    "code": ImmutableLine["code"];
};
