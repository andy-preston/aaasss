import type { Line } from "../line/line-types.ts";

export type MacroName = string;

export type MacroParameters = Array<string>;

export const macro = (parameters: MacroParameters) => ({
    "lines": [] as Array<Line>,
    "parameters": parameters
});

export type Macro = ReturnType<typeof macro>;

export type MacroList = Map<MacroName, Macro>;
