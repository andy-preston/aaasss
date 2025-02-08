import type { LineWithTokens } from "../tokens/line-types.ts";

export type MacroName = string;

export type DefinedParameters = Array<string>;
export type ActualParameters = Array<string | number>;

type MacroLines = Array<LineWithTokens>;

export const macro = (parameters: DefinedParameters) => ({
    "lines": [] as MacroLines,
    "parameters": parameters
});

export type Macro = ReturnType<typeof macro>;

export type MacroList = Map<MacroName, Macro>;
