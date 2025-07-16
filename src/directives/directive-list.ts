import type { DataMemory } from "../data-memory/data-memory.ts";
import type { DeviceChooser } from "../device/chooser.ts";
import type { Macros } from "../macros/macros.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { DirectiveFunction, DirectiveName, Parameters } from "./data-types.ts";
import type { FunctionDirectives } from "./function-directives.ts";

const none: Parameters = [], itsComplicated: Parameters = undefined;

export const directiveList = (
    dataMemory: DataMemory,
    deviceChooser: DeviceChooser,
    fileStack: FileStack,
    functionDirectives: FunctionDirectives,
    macros: Macros,
    programMemory: ProgramMemory,
    symbolTable: SymbolTable,
    objectCode: ObjectCode
): Record<
DirectiveName, [DirectiveFunction,             Parameters,         ]
> => ({
"alloc":       [dataMemory.alloc,              ["string", "number"]],
"allocStack":  [dataMemory.allocStack,         [          "number"]],
"assembleIf":  [objectCode.assembleIf,         [         "boolean"]],
"complement":  [functionDirectives.complement, [          "number"]],
"define":      [symbolTable.persistentSymbol,  ["string", "number"]],
"device":      [deviceChooser,                 ["string"          ]],
"end":         [macros.end,                      none,             ],
"high":        [functionDirectives.high,       [          "number"]],
"include":     [fileStack.include,             ["string"          ]],
"low":         [functionDirectives.low,        [          "number"]],
"macro":       [macros.define,                   itsComplicated,   ],
"origin":      [programMemory.origin,          [          "number"]],
"poke":        [objectCode.poke,                 itsComplicated,   ]
});

export type DirectiveList = ReturnType<typeof directiveList>;
