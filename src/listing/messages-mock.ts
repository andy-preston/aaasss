import { Failure } from "../failure/failure-or-box.ts";
import { LineWithObjectCode } from "../object-code/line-types.ts";

export const mockFailureMessages = (
    failure: Failure, _line: LineWithObjectCode
) => {
    const result: Array<string> = [failure.kind];

    if (failure.operand) {
        result.push(`(${failure.operand})`);
    }

    return failure.extra instanceof Error
        ? result.concat([failure.extra.name, failure.extra.message])
        : failure.extra != undefined
        ? result.concat(failure.extra)
        : result;
};
