import { Failure } from "../failure/failure-or-box.ts";
import { LineWithObjectCode } from "../object-code/line-types.ts";

export const mockFailureMessages = (
    failure: Failure, _line: LineWithObjectCode
) => {
    const result: Array<string> = [failure.kind];

    if (failure.extra instanceof Error) {
        result.push(failure.extra.name);
        result.push(failure.extra.message);
        return result;
    }

    if (failure.extra != undefined) {
        result.push(failure.extra);
    }

    return result;
};
