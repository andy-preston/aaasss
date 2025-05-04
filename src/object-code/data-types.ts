import type { ImmutableLine } from "../assembler/line-types.ts";
import type { InstructionSet } from "../device/instruction-set.ts";

export type BinaryDigit = "0" | "1";

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

export type EncodedInstruction =
    (instructionSet: InstructionSet) => ImmutableLine;
