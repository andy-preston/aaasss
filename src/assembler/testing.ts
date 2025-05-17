import { line } from "../line/line-types.ts";

export const mockNextPass = function* () {
    yield line("", 0, "", "", 0, true).withPass(1);
    yield line("", 0, "", "", 0, false).withPass(2);
};
