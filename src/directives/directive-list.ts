import type { DataMemory } from "../data-memory/data-memory.ts";
import type { DeviceChooser } from "../device/chooser.ts";
import type { Macros } from "../macros/macros.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { DirectiveFunction, DirectiveName, Parameters } from "./data-types.ts";
import { complement, highByte, lowByte } from "./function-directives.ts";

const none: Parameters = [], itsComplicated: Parameters = undefined;

export const directiveList = (
    dataMemory: DataMemory,
    deviceChooser: DeviceChooser,
    fileStack: FileStack,
    macros: Macros,
    programMemory: ProgramMemory,
    symbolTable: SymbolTable,
    objectCode: ObjectCode
): Record<
DirectiveName, [DirectiveFunction,             Parameters,         ]
> => ({
"alloc":       [dataMemory.alloc,              ["label",  "number"]],
"allocStack":  [dataMemory.allocStack,         [          "number"]],
"assembleIf":  [objectCode.assembleIf,         [         "boolean"]],
"complement":  [complement,                    [      "signedByte"]],
"define":      [symbolTable.persistentSymbol,  ["label",  "number"]],
"device":      [deviceChooser,                 ["string"          ]],
"end":         [macros.end,                      none,             ],
"high":        [highByte,                      [            "word"]],
"include":     [fileStack.include,             ["string"          ]],
"label":       [programMemory.label,           ["label"           ]],
"low":         [lowByte,                       [            "word"]],
"macro":       [macros.define,                   itsComplicated,   ],
"origin":      [programMemory.origin,          [          "number"]],
"poke":        [objectCode.poke,                 itsComplicated,   ]
});

export type DirectiveList = ReturnType<typeof directiveList>;
