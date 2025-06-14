import type {
    AssertionFailure, ClueFailure, DefinitionFailure,
    ExceptionFailure, NumericTypeFailure, SupportFailure
} from "../failure/bags.ts";
import type { FailureKind } from "../failure/kinds.ts";
import type { FailureMessage } from "./languages.ts";

import {
    assertionFailure, clueFailure, definitionFailure,
    exceptionFailure, numericTypeFailure, supportFailure
} from "./failure.ts";
import { location } from "./languages.ts";

export const listingTitles = {
    "symbolTable": "Symbol Table"
};

const withLocation = location("operand", "parameter");

export const messages: Record<FailureKind, FailureMessage> = {
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
    "parameter_firstName": (failure) => withLocation(failure, [
        "A first parameter of a definition should be a name"
    ]),
    "parameter_count": (failure) => withLocation(failure, assertionFailure(
        ["Parameter count is not what was expected"],
        "Expected", "Actual",
        failure as AssertionFailure
    )),
    "programMemory_cantOrg": (failure) => withLocation(failure, [
        "You can't have an org on a line that already has some code",
        "If this is annoying and you've got a good use case, get in touch and we'll talk about changing it"
    ]),
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
    "register_notFound":  (failure) => withLocation(failure, [
        `Register ${(failure as ClueFailure).clue} not found`
    ]),
    "notSupported_ioRange": (failure) => withLocation(failure, supportFailure(
        [
            "Some devices have extended GPIO outside of the normal IO area of data memory",
            "alternatively, there might be a mistake with the value of this address"
        ],
        "This instruction can only use the IO range of data memory",
        "Perhaps you could use", "as it has access to all of data memory",
        failure as SupportFailure
    )),
    "notSupported_mnemonic": (failure) => withLocation(failure, supportFailure(
        [],
        "This instruction is not supported on the selected device",
        "Perhaps, you could use", "instead",
        failure as SupportFailure
    )),
    "symbol_alreadyExists": (failure) => withLocation(failure, definitionFailure(
        ["Symbol already exists"],
        "Symbol name", "Existing definition",
        failure as DefinitionFailure
    )),
    "syntax_invalidLabel": (failure) => withLocation(failure, [
        "A label must only contain alphanumeric characters and underscore"
    ]),
    "syntax_invalidMnemonic": (failure) => withLocation(failure, [
        "A mnemonic should only contain letters"
    ]),
    "type_relativeAddress": (failure) => withLocation(failure, [
        "Relative address"
    ]),
    "type_7Bit": (failure) => withLocation(failure, numericTypeFailure(
        ["7 Bit Value out of range"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_bitIndex": (failure) => withLocation(failure, numericTypeFailure(
        ["Bit index out of range"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_byte":  (failure) => withLocation(failure, numericTypeFailure(
        ["Byte out of range"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_bytesOrString": (failure) => withLocation(failure, numericTypeFailure(
        ["Should be a string or an array of byte values"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_failure": (failure) => withLocation(failure, assertionFailure(
        ["The type of the operand / parameter doesn't match the requirements"],
        "Expected type", "Actual type",
        failure as AssertionFailure
    )),
    "type_ioPort": (failure) => withLocation(failure, numericTypeFailure(
        ["IO port address out of range"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_anything": (failure) => withLocation(failure, numericTypeFailure(
        ["This operand should only have a symbolic value"],
        "Defined range", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_nybble": (failure) => withLocation(failure, numericTypeFailure(
        ["Nybble (half byte) out of range"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_6Bit": (failure) => withLocation(failure, numericTypeFailure(
        ["6-bit value out of range"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_positive": (failure) => withLocation(failure, numericTypeFailure(
        ["This should be a positive number only"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_register": (failure) => withLocation(failure, numericTypeFailure(
        ["This should be a register only"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_registerImmediate": (failure) => withLocation(failure, numericTypeFailure(
        ["This should be an immediate register only"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_registerMultiply": (failure) => withLocation(failure, numericTypeFailure(
        ['This should be a "multiply register"'],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_registerPair": (failure) => withLocation(failure, numericTypeFailure(
        ["This should be a register pair only"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_anyRegisterPair": (failure) => withLocation(failure, numericTypeFailure(
        ["This should be a register pair only"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
    "type_word": (failure) => withLocation(failure, numericTypeFailure(
        ["16 bit word out of range"],
        "Defined value", "Actual value",
        failure as NumericTypeFailure
    )),
        "value_type":  (failure) => withLocation(failure, assertionFailure(
        ["Operand not as expected"],
        "Allowed values", "Actual Value",
        failure as AssertionFailure
    )),
} as const;
