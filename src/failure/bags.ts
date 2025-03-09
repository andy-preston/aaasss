import type { OperandIndex } from "../operands/data-types.ts";
import type { BooleanBag, NumberBag, StringBag, StringsBag } from "../assembler/bags.ts";
import type { OldFailureKind } from "./failures.ts";

type FailureOperand = undefined | OperandIndex;

export const boringFailure = (
    kind: "syntax_invalidLabel"
        | "js_jsMode" | "js_assemblerMode"
        | "programMemory_sizeUnknown"
        | "ram_sizeUnknown" | "ram_stackAllocated"
) => ({
    "kind": kind, "operand": undefined as FailureOperand
});

export type BoringFailure = ReturnType<typeof boringFailure>;

export const clueFailure = (
    kind: "file_notFound"
        | "mnemonic_unknown"
        | "mnemonic_notSupported" | "mnemonic_supportedUnknown",
    clue: string
) => ({
    "kind": kind, "operand": undefined as FailureOperand,
    "clue": clue
});

export type ClueFailure = ReturnType<typeof clueFailure>;

export const exceptionFailure = (
    kind: "js_error",
    exception: string,
    message: string
) => ({
    "kind": kind, "operand": undefined as FailureOperand,
    "exception": exception, "message": message
});

export type ExceptionFailure = ReturnType<typeof exceptionFailure>;

export const memoryRangeFailure = (
    kind: "programMemory_outOfRange" | "ram_outOfRange",
    bytesAvailable: number,
    bytesRequested: number
) => ({
    "kind": kind, "operand": undefined as FailureOperand,
    "bytesAvailable": bytesAvailable, "bytesRequested": bytesRequested
});

export type MemoryRangeFailure = ReturnType<typeof memoryRangeFailure>;

export const oldFailure = (
    kind: OldFailureKind,
    extra: Array<string> | undefined
) => ({
    "kind": kind,
    "extra": extra,
    "operand": undefined as FailureOperand,
});

export type OldFailure = ReturnType<typeof oldFailure>;

export type NewFailure = BoringFailure | ClueFailure
    | ExceptionFailure | MemoryRangeFailure;

export type Failure = OldFailure | NewFailure;
export type FailureKind = OldFailureKind | NewFailure["kind"];

export const bagOfFailures = (failures: Array<Failure>) =>
    ({ "type": "failures" as const, "it": failures });
export type BagOfFailures = ReturnType<typeof bagOfFailures>;

export type NumberOrFailures = NumberBag | BagOfFailures;
export type StringOrFailures = StringBag | BagOfFailures;
export type StringsOrFailures = StringsBag | BagOfFailures;
export type BooleanOrFailures = BooleanBag | BagOfFailures;

export type BagOrFailures =
    NumberBag | StringBag |  StringsBag | BooleanBag | BagOfFailures;
