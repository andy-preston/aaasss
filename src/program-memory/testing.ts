import { deviceProperties } from "../device/properties.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import type { Label } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";
import { pass } from "../assembler/pass.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    const table = symbolTable(context, pass().public);
    const properties = deviceProperties(table);
    return {
        "context": context,
        "expression": jSExpression(context),
        "properties": properties,
        "memory": programMemory(table, properties.public)
    };
};

export const testLine = (label: Label, pokes: Array<Code>, code: Code) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, "", []);
    const processed = lineWithProcessedMacro(tokenised, false);
    const withOperands = lineWithOperands(processed, [], []);
    const poked = lineWithPokedBytes(withOperands, pokes);
    return lineWithObjectCode(poked, code);
};
