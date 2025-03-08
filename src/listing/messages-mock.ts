import { Failure } from "../failure/bags.ts";
import { LineWithObjectCode } from "../object-code/line-types.ts";

export const mockFailureMessages = (
    failure: Failure, _line: LineWithObjectCode
) => {
    const result: Array<string> = [failure.kind];

    const push = (label: string, value: string) => {
        if (value != undefined) {
            result.push(`${label}: ${value}`);
        }
    }

    for (const property in failure) {
        if (!["kind", "onOperand"].includes(property)) {
            // deno-lint-ignore no-explicit-any
            const value = (failure as any)[property];
            if (Array.isArray(value)) {
                // deno-lint-ignore no-explicit-any
                for (const [index, item] of (value as Array<any>).entries()) {
                    push(`${property}[${index}]`, item);
                }
            } else {
                push(property, value);
            }
        }
    }
    return result;
};
