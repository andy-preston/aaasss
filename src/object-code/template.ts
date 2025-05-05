import type { BinaryDigit, Code } from "../object-code/data-types.ts";
import type { NumericOperand } from "../operands/data-types.ts";

type Binary = Array<BinaryDigit>;

const bitSource = (decimal: number) => {
    // As we don't really know how many bits we're going to need or use,
    // we don't know how much to pad the binary string with leading zeros.
    // So this process is done "in reverse" with the least significant bits
    // first and emitting the leading zeros at the end until no more bits are
    // needed.
    const bits = decimal.toString(2).split("").reverse() as Binary;
    return (): BinaryDigit => (bits.length > 0 ? bits.shift()! : "0");
};

type TemplateOperand =
    | "r" // register
    | "s" // source register
    | "d" // destination register
    | "a" // address
    | "v" // value
    | "b" // bit index

type Substitutions = Partial<Record<TemplateOperand, NumericOperand>>;

type TemplateDigit = TemplateOperand | BinaryDigit;

const substitutionMap = (substitutions: Substitutions) => {
    const bitSources = new Map(
        Object.entries(substitutions).map(substitution => [
            substitution[0] as TemplateDigit,
            bitSource(substitution[1])
        ])
    );
    return (digit: TemplateDigit) =>
        bitSources.has(digit) ? bitSources.get(digit)!() : digit;
};

export const template = (
    templateString: string, // format: "0101_011d dddd_0qqq"
    substitutions: Substitutions
): Code => {
    const map = substitutionMap(substitutions);
    const code: Array<number> = templateString
        .replaceAll("_", "") // underscores are for convenience
        .split("")           // a list of bits and spaces
        .reverse()           // bits are processed least significant first
        .map(digit => map(digit as TemplateDigit))
        .reverse()           // bits are written most significant first
        .join("")            // stick 'em back together prior to...
        .split(" ")          // splitting them into bytes this time
        .map(byte => Number.parseInt(byte, 2));
    return code as unknown as Code;
};

////////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2025, Andy Preston
//
// This file is based on parts of https://github.com/LingDong-/avrlass which is
// Copyright (c) 2023 Lingdong Huang under the MIT license.
//
////////////////////////////////////////////////////////////////////////////////
