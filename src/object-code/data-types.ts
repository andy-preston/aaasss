import type { ImmutableLine } from "../assembler/line-types.ts";
import type { InstructionSet } from "../device/instruction-set.ts";
import { ProgramMemory } from "../program-memory/program-memory.ts";

export type BinaryDigit = "0" | "1";

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

export type EncodedInstruction = (
    instructionSet: InstructionSet, programMemory: ProgramMemory
) => ImmutableLine;
