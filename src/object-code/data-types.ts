import type { InstructionSet } from "../device/instruction-set.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

export type BinaryDigit = "0" | "1";

export type Code = [number, number];

export type EncodedInstruction = (
    instructionSet: InstructionSet, programMemory: ProgramMemory
) => Array<number>;
