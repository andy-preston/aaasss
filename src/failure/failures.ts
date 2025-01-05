import { OperandIndex } from "../operands/data-types.ts";

export type FailureKind =
    | "context_redefined"
    | "device_notFound" | "device_notSelected" | "device_multiple"
    | "file_notFound"
    | "js_error" | "js_jsMode" | "js_assemblerMode"
    | "macro_define" | "macro_end" | "macro_params" | "macro_empty"
        | "macro_name" | "macro_notExist"
    | "mnemonic_supportedUnknown" | "mnemonic_notSupported" | "mnemonic_unknown"
    | "operand_outOfRange" | "operand_wrongCount" | "operand_blank"
        | "operand_wrongType"
        | "operand_offsetX" | "operand_offsetNotLdd" | "operand_offsetNotStd"
    | "syntax_invalidLabel"
    | "type_string" | "type_positive" | "type_bytes" | "type_strings"
        | "type_params"
    | "programMemory_outOfRange" | "programMemory_sizeUnknown"
    | "ram_outOfRange" | "ram_sizeUnknown" | "ram_stackAllocated";

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    extra: Error | string | undefined
) => {
    const onOperand = (index: OperandIndex) => {
        object.operand = index;
        return object;
    }
    const object = {
        "which": "failure" as const,
        "operand": operand,
        "onOperand": onOperand,
        "kind": kind,
        "extra": extra,
    };
    return object;
};

export type Failure = Readonly<ReturnType<typeof failure>>;
export type Failures = Array<Failure>;
