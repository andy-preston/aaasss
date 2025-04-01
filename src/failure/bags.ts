import type { OperandIndex } from "../operands/data-types.ts";
import type { BooleanBag, NumberBag, StringBag, StringsBag } from "../assembler/bags.ts";
import type { NumericType } from "../numeric-values/types.ts";

type OperandLocation = {
    "operand": OperandIndex
};

type ParameterLocation = {
    "parameter": number
};

type FailureLocation = undefined | OperandLocation | ParameterLocation;

export const boringFailure = (
    kind: "syntax_invalidLabel"
        | "device_notSelected"
        | "js_jsMode" | "js_assemblerMode"
        | "macro_end" | "macro_noEnd"
        | "operand_blank" | "operand_offsetNotLdd" | "operand_offsetNotStd"
        | "operand_offsetX"
        | "parameter_firstName"
        | "programMemory_sizeUnknown"
        | "ram_sizeUnknown" | "ram_stackAllocated"
) => ({
    "kind": kind, "location": undefined as FailureLocation
});

export type BoringFailure = ReturnType<typeof boringFailure>;

export const comparisonFailure = (
    kind: "device_multiple",
    before: string, after: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "before": before, "after": after
});

export type ComparisonFailure = ReturnType<typeof comparisonFailure>;

export const typeFailure = (
    kind: "type_failure",
    expected: string, actual: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "expected": expected, "actual": actual
});

export type TypeFailure = ReturnType<typeof typeFailure>;

export const numericTypeFailure = (
    kind: NumericType | "type_bytesOrString",
    value: unknown, min: number, max: number | undefined
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "value": value, "min": min, "max": max
});

export type NumericTypeFailure = ReturnType<typeof numericTypeFailure>;

export const clueFailure = (
    kind: "file_notFound" | "device_notFound"
        | "macro_multiDefine" | "macro_name"  | "macro_params"
        | "mnemonic_unknown"
        | "mnemonic_notSupported" | "mnemonic_supportedUnknown"
        | "operand_count" | "parameter_count"
        | "symbol_alreadyExists",
    clue: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "clue": clue
});

export type ClueFailure = ReturnType<typeof clueFailure>;

export const deviceFailure = (
    kind: "device_internalFormat" | "symbol_notFound",
    device: string, clue: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "device": device, "clue": clue
});

export type DeviceFailure = ReturnType<typeof deviceFailure>;

export const exceptionFailure = (
    kind: "js_error",
    exception: string,
    message: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "exception": exception, "message": message
});

export type ExceptionFailure = ReturnType<typeof exceptionFailure>;

export const memoryRangeFailure = (
    kind: "programMemory_outOfRange" | "ram_outOfRange",
    bytesAvailable: number,
    bytesRequested: number
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "bytesAvailable": bytesAvailable, "bytesRequested": bytesRequested
});

export type MemoryRangeFailure = ReturnType<typeof memoryRangeFailure>;

export type Failure = BoringFailure | ClueFailure | ComparisonFailure
    | DeviceFailure | ExceptionFailure | MemoryRangeFailure
    | NumericTypeFailure | TypeFailure;

export type FailureKind = Failure["kind"];

export const bagOfFailures = (failures: Array<Failure>) =>
    ({ "type": "failures" as const, "it": failures });
export type BagOfFailures = ReturnType<typeof bagOfFailures>;

export type NumberOrFailures = NumberBag | BagOfFailures;
export type StringOrFailures = StringBag | BagOfFailures;
export type StringsOrFailures = StringsBag | BagOfFailures;
export type BooleanOrFailures = BooleanBag | BagOfFailures;

export type BagOrFailures =
    NumberBag | StringBag |  StringsBag | BooleanBag | BagOfFailures;
