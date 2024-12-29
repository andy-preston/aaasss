import { OperandIndex } from "../operands/data-types.ts";

type FailureWithLine =
    | "context_redefined"
    | "device_notFound" | "device_notSelected" | "device_multiple"
    | "file_notFound"
    | "js_error" | "js_jsMode" | "js_assemblerMode"
    | "macro_define" | "macro_end" | "macro_params" | "macro_empty"
        | "macro_name" | "macro_notExist"
    | "mnemonic_supportedUnknown" | "mnemonic_notSupported" | "mnemonic_unknown"
    | "operand_outOfRange" | "operand_wrongCount" | "operand_tooManyIndexOffset"
    | "syntax_invalidLabel"
    | "type_string" | "type_positive" | "type_bytes" | "type_strings"
        | "type_params"
    | "programMemory_outOfRange" | "programMemory_sizeUnknown"
    | "ram_outOfRange" | "ram_sizeUnknown" | "ram_stackAllocated";

export type FailureKind = FailureWithLine;

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    extra: Error | string | undefined
) => ({
    "which": "failure" as const,
    "operand": operand,
    "kind": kind,
    "extra": extra,
});

export type Failure = Readonly<ReturnType<typeof failure>>;
export type Failures = Array<Failure>;
