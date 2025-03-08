import type { OperandIndex } from "../operands/data-types.ts";
import type { BooleanBag, NumberBag, StringBag, StringsBag } from "../assembler/bags.ts";
import type { FailureKind } from "./failures.ts";

type Extra = Array<string> | undefined;

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    extra: Extra
) => {
    const onOperand = (index: OperandIndex) => {
        object.operand = index;
        return object;
    }
    const object = {
        "operand": operand,
        "onOperand": onOperand,
        "kind": kind,
        "extra": extra,
    };
    return object;
};

export type Failure = Readonly<ReturnType<typeof failure>>;

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
