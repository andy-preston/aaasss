import type { DirectiveFunction } from "../directives/data-types.ts";

export const discreteTypes = ["string", "number"] as const;

// Using `type DiscreteType = typeof discreteTypes[number];`
// gives a type that is `"string" | "number"`
// But there's doesn't seem to be a way to take it a stage further
// and get a type is `string | number`
export type DiscreteType = string | number;

export const isDiscrete = (thingy: unknown): thingy is DiscreteType =>
    (discreteTypes as unknown as Array<string>).includes(typeof thingy);

export type SymbolValue = DiscreteType | DirectiveFunction;
