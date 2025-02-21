import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Label } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";

export const systemUnderTest = () => {
    const currentPass = pass();
    const device = deviceProperties();
    const symbols = symbolTable(
        directiveList(), device.public, cpuRegisters() ,currentPass
    );
    return {
        "pass": currentPass,
        "symbolTable": symbols,
        "deviceProperties": device,
        "programMemory": programMemory(symbols, device.public),
        "jsExpression": jSExpression(symbols)
    };
};

export const testLine = (label: Label, pokes: Array<Code>, code: Code) => {
    const raw = lineWithRawSource("", 0, "", "", 0, false);
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, "", []);
    const processed = lineWithProcessedMacro(tokenised, false);
    const withOperands = lineWithOperands(processed, [], []);
    const poked = lineWithPokedBytes(withOperands, pokes);
    return lineWithObjectCode(poked, code);
};
