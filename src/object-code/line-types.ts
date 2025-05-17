import type { ImmutableLine, MutableLine } from "../line/line-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { CodeGenerator } from "./data-types.ts";

export interface LineWithObjectCode extends LineWithOperands {
    "code": ImmutableLine["code"];
};

export const lineWithObjectCode = (
    line: LineWithOperands, codeGenerator: CodeGenerator | undefined
) => {
    if (codeGenerator != undefined) {
        codeGenerator.forEach(code => {
            (line as MutableLine).code.push(code);
        });
    }
    return line as ImmutableLine;
};
