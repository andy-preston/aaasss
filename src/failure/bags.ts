import type { OperandIndex } from "../operands/data-types.ts";
import type { BooleanBag, NumberBag, StringBag, StringsBag } from "../assembler/bags.ts";
import type { OldFailureKind } from "./failures.ts";

export type FileNotFoundFailure = {
    "kind": "file_notFound", "message": string
};

export type InvalidLabelFailure = {
    "kind": "syntax_invalidLabel"
};

export const oldFailure = (
    operand: OperandIndex | undefined,
    kind: OldFailureKind,
    extra: Array<string> | undefined
) => {
    const onOperand = (index: OperandIndex) => {
        object.operand = index;
        return object;
    }
    const object = {
        "kind": kind,
        "extra": extra,
        "operand": operand,
        "onOperand": onOperand
    };
    return object;
};
export type OldFailure = Readonly<ReturnType<typeof oldFailure>>;
export type NewFailure =
    FileNotFoundFailure | InvalidLabelFailure;

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

export const extractedFailures = (symbol: BagOrFailures): Array<Failure> =>
    symbol.type == "failures" ? symbol.it : [];
