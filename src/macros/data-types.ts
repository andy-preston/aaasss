import type { SourceCode } from "../source-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";

export type MacroName = string;

export type MacroParameters = Array<string>;

type StoredLine = {
    "sourceCode": SourceCode,
    "label": Label
}

export const macro = (parameters: MacroParameters) => ({
    "lines": [] as Array<StoredLine>,
    "parameters": parameters
});

export type Macro = ReturnType<typeof macro>;

export type MacroList = Map<MacroName, Macro>;
