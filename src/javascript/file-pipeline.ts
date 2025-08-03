import type { PipelineProcess } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import type { JsFunction } from "./function.ts";

export const jsFilePipeline = (
    currentLine: CurrentLine, jsFunction: JsFunction
):PipelineProcess => {
    let sourceCode: Array<SourceCode> = [];

    return (): void => {
        if (!currentLine().fileName.endsWith(".js")) {
            return;
        }
        sourceCode.push(currentLine().sourceCode);
        if (!currentLine().eof) {
            return;
        }
        const javascript = sourceCode.join("\n");
        sourceCode = [];
        jsFunction(javascript);
    };
};

export type jsFilePipeline = ReturnType<typeof jsFilePipeline>;
