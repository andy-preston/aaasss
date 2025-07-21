import type { DirectiveResult } from "./data-types.ts";

export const lowByte = (word: number): DirectiveResult =>
    word & 0xff;

export const highByte = (word: number): DirectiveResult =>
    (word >> 8) & 0xff;

export const complement = (byte: number): DirectiveResult =>
    byte < 0 ? 0x0100 + byte : byte;
