import type { LineWithTokens } from "../tokens/line-types.ts";

export type MacroName = string;

export type MacroParameters = Array<string>;

type MacroLines = Array<LineWithTokens>;

export const macro = (parameters: MacroParameters) => ({
    "lines": [] as MacroLines,
    "parameters": parameters
});

export type Macro = ReturnType<typeof macro>;

export type MacroList = Map<MacroName, Macro>;
