import { line } from "./line.ts";

export const mockLastLine = function* () {
    yield line("", 0, "", "", 0, true);
};
