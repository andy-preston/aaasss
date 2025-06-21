import type { Pass } from "../assembler/data-types.ts";
import type { Failure } from "../failure/bags.ts";
import type { Code } from "../object-code/data-types.ts";
import type { Operands } from "../operands/data-types.ts";
import type { FileName, LineNumber, SourceCode } from "../source-code/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

export const emptyLine = (fileName: FileName) => ({
    "failures": [] as Array<Failure>,
    "pass": 0 as Pass,
    "fileName": fileName,
    "lineNumber": 0 as LineNumber,
    "eof": false,
    "rawSource": "" as SourceCode,
    "assemblySource": "" as SourceCode,
    "label": "" as Label,
    "mnemonic": "" as Mnemonic,
    "isDefiningMacro": false,
    "macroName": "",
    "macroCount": 0,
    "operands": [] as Operands,
    "address": 0,
    "code": [] as Array<Code>
});

export type Line = ReturnType<typeof emptyLine>;
