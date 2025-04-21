import type { AssertionFailure, ClueFailure, DefinitionFailure, ExceptionFailure } from "../failure/bags.ts";
import type { FailureKind } from "../failure/kinds.ts";
import type { FailureMessage } from "./languages.ts";

import { assertionFailure, clueFailure, definitionFailure, exceptionFailure, location } from "./failure-explanation.ts";

export const listingTitles = {
    "symbolTable": "Symbol Table"
};

const withLocation = location("operand", "parameter");

export const messages: Record<FailureKind, FailureMessage> = {
    "device_multiple": (failure) => withLocation(failure, assertionFailure(
        ["You should select only one device type"],
        "Original selection", "Subsequent selection (which will not work)",
        failure as AssertionFailure
    )),
    "device_notFound": (failure) => withLocation(failure, clueFailure(
        ["Device specification not found"],
        "Can't find a device specification for",
        failure as ClueFailure
    )),
    "device_notSelected": (failure) => withLocation(failure, [
        "No device selected (use the 'device' directive?)"
    ]),
    "file_notFound": (failure) => withLocation(failure, clueFailure(
        ["File not found"],
        "Javascript error message",
        failure as ClueFailure
    )),
    "js_assemblerMode": (failure) => withLocation(failure, [
        "\"}}\" when already in assembly mode"
    ]),
    "js_error": (failure) => withLocation(failure, exceptionFailure(
        ["Javascript error"],
        "Exception name", "Exception details",
        failure as ExceptionFailure
    )),
    "js_jsMode": (failure) => withLocation(failure, [
        "\"{{\" when already in js mode"
    ]),
    "macro_noEnd": (failure) => withLocation(failure, [
        "Macro definition was not closed"
    ]),
    "macro_multiDefine": (failure) => withLocation(failure, clueFailure(
        ["You can't define a macro whilst you're still defining another"],
        "Macro still being defined",
        failure as ClueFailure
    )),
    "macro_end": (failure) => withLocation(failure, [
        "Can't end macro definition when a macro is not being defined"
    ]),
    "macro_params": (failure) => withLocation(failure, assertionFailure(
        ["Macro parameters different from defined number"],
        "Expected parameter count", "Actual parameter count",
        failure as AssertionFailure
    )),
    "mnemonic_implicitElpmNotLpm": (failure) => withLocation(failure, [
        "If a device has an implicit ELPM instruction, it can't have an implicit LPM instruction",
        "The opcodes for the two instructions are identical, but ELPM uses the RAMPZ register",
        "And it's better to use ELPM to explicitly state that in your code."
    ]),
    "mnemonic_notSupported": (failure) => withLocation(failure, clueFailure(
        ["Instruction not supported on device"],
        "Instruction mnemonic",
        failure as ClueFailure
    )),
    "mnemonic_supportedUnknown": (failure) => withLocation(failure, clueFailure(
        ["Can't determine if instruction is supported or not"],
        "Instruction mnemonic",
        failure as ClueFailure
    )),
    "mnemonic_unknown": (failure) => withLocation(failure, clueFailure(
        ["Instruction isn't supported"],
        "Instruction mnemonic",
        failure as ClueFailure
    )),
    "operand_blank": (failure) => withLocation(failure, [
        "Operand seems to be blank"
    ]),
    "operand_offsetNotLdd": (failure) => withLocation(failure, [
        "An Index offset in the second parameter can only be used on the LDD instruction"
    ]),
    "operand_offsetNotStd": (failure) => withLocation(failure, [
        "An Index offset in the first parameter can only be used on the STD instruction"
    ]),
    "operand_offsetX": (failure) => withLocation(failure, [
        "Index offset instructions only operate on the Y or Z registers"
    ]),
    "operand_count": (failure) => withLocation(failure, assertionFailure(
        ["Number of operands not expected"],
        "Expected", "Actual",
        failure as AssertionFailure
    )),
    "operand_symbolic":  (failure) => withLocation(failure, assertionFailure(
        ["Operand not as expected"],
        "Allowed values", "Actual Value",
        failure as AssertionFailure
    )),
    "parameter_firstName": (failure) => withLocation(failure, [
        "A first parameter of a definition should be a name"
    ]),
    "parameter_count": (failure) => withLocation(failure, assertionFailure(
        ["Parameter count is not what was expected"],
        "Expected", "Actual",
        failure as AssertionFailure
    )),
    "programMemory_outOfRange": (failure) => withLocation(failure, assertionFailure(
        ["Out of program memory"],
        "Available (16 bit) words", "Current address",
        failure as AssertionFailure
    )),
    "programMemory_sizeUnknown": (failure) => withLocation(failure, [
        "Size of program memory is unknown"
    ]),
    "ram_outOfRange": (failure) => withLocation(failure, assertionFailure(
        ["SRAM address out of range"],
        "Maximum available (byte) address", "Current address",
        failure as AssertionFailure
    )),
    "ram_sizeUnknown": (failure) => withLocation(failure, [
        "Size of SRAM is unknown"
    ]),
    "ram_stackAllocated": (failure) => withLocation(failure, [
        "Stack Already Allocated"
    ]),
    "symbol_alreadyExists": (failure) => withLocation(failure, definitionFailure(
        ["Symbol already exists"],
        "Symbol name", "Existing definition",
        failure as DefinitionFailure
    )),


    "symbol_notFound": (failure) => withLocation(failure, [""]),
    "syntax_invalidLabel": (failure) => withLocation(failure, [
        "A label must only contain alphanumeric characters and underscore"
    ]),
    "syntax_invalidMnemonic": (failure) => withLocation(failure, [""]),
    "type_16BitDataAddress": (failure) => withLocation(failure, [""]),
    "type_7BitDataAddress": (failure) => withLocation(failure, [""]),
    "type_bitIndex": (failure) => withLocation(failure, [""]),
    "type_byte":  (failure) => withLocation(failure, [""]),
    "type_bytesOrString": (failure) => withLocation(failure, [
        "Should be a string or an array of byte values"
    ]),
    "type_failure": (failure) => withLocation(failure, [
        "The type of the operands / parameters don't match the requirements"
    ]),
    "type_ioPort": (failure) => withLocation(failure, [""]),
    "type_nothing": (failure) => withLocation(failure, [""]),
    "type_nybble": (failure) => withLocation(failure, [""]),
    "type_positive": (failure) => withLocation(failure, [""]),
    "type_register": (failure) => withLocation(failure, [""]),
    "type_registerImmediate": (failure) => withLocation(failure, [""]),
    "type_word": (failure) => withLocation(failure, [""]),
} as const;
