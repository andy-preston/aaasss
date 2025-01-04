import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";

export const testLine = (source: SourceCode) => {
    const raw = lineWithRawSource("", 0, false, source);
    return lineWithRenderedJavascript(raw, source);
};

