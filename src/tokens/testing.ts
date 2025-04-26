import type { SourceCode } from "../source-code/data-types.ts";

import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { assemblyPipeline } from "./assembly-pipeline.ts";

export const systemUnderTest = (...sourceLines: Array<SourceCode>) => {
    const testLines = function* () {
        for (const sourceCode of sourceLines) {
            const $lineWithRawSource = lineWithRawSource(
                "", 0, sourceCode, "", 0, false
            );
            yield lineWithRenderedJavascript(
                $lineWithRawSource, sourceCode
            );
        }
    };

    return {
        "assemblyPipeline": assemblyPipeline(testLines())
    };
};
