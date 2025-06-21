import type { Min, Max } from "../assembler/validation.ts";
import type { Failure } from "../failure/bags.ts";

import { assertionFailure } from "../failure/bags.ts";

const limits = {
    "word": [   0, 0xffff],
    "byte": [   0,   0xff]
} as const satisfies Record<
    string, [ Min,    Max]
>;

type ParameterType = keyof NoInfer<typeof limits>;

export const range = (
    given: number, parameterType: ParameterType, location: number
): Failure | undefined => {
    const [min, max] = limits[parameterType];
    const reasons: Array<string> = [];
    if (max != undefined && given > max) {
        reasons.push(`${given} > ${max}`);
    }
    if (min != undefined && given < min) {
        reasons.push(`${given} < ${min}`);
    }
    if (reasons.length == 0) {
        return undefined;
    }
    const failure = assertionFailure(
        "value_type", parameterType, reasons.join(", ")
    );
    failure.location = {"parameter": location};
    return failure;
};
