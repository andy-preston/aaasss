import { deviceProperties } from "../device/properties.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import type { Label } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    const properties = deviceProperties(context);
    return {
        "context": context,
        "properties": properties,
        "memory": programMemory(context, properties.public)
    };
};

export const testLine = (label: Label, pokes: Array<Code>, code: Code) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, "", []);
    const processed = lineWithProcessedMacro(tokenised, "");
    const withOperands = lineWithOperands(processed, [], []);
    const poked = lineWithPokedBytes(withOperands, pokes);
    return lineWithObjectCode(poked, code);
};
