import type { InstructionSet } from "../device/instruction-set.ts";
import type { ImmutableLine } from "../line/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

export type BinaryDigit = "0" | "1";

export type Code = readonly [] | readonly [number, number];

export type CodeGenerator = Generator<Code, void, void>;

export type EncodedInstruction = (
    instructionSet: InstructionSet, programMemory: ProgramMemory
) => ImmutableLine;
