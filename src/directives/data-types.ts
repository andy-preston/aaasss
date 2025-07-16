export type DirectiveResult = string | number | undefined;

export type DirectiveName = string;

// deno-lint-ignore no-explicit-any
export type UncheckedParameters = Array<any>;

export type DirectiveFunction = (
    ...parameters: UncheckedParameters
) => DirectiveResult;

export type ParameterTypes = Array<"string" | "number" | "boolean">;

export type Parameters = undefined | ParameterTypes;
