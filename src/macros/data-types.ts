import { ParameterDefinitions } from "../directives/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";

export type MacroName = string;

type MacroLines = Array<LineWithTokens>;

export const macro = (parameters: ParameterDefinitions) => ({
    "lines": [] as MacroLines,
    "parameters": parameters
});

export type Macro = ReturnType<typeof macro>;

export type MacroList = Map<MacroName, Macro>;
