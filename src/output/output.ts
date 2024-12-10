import type { Failure } from "../coupling/value-failure.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { Pass } from "../pass/pass.ts";

export const output = (pass: Pass) => {

    const line = (line: LineWithObjectCode) => {
        if (pass.showErrors()) {
            console.log(line);
        }
    };

    const final = (failures: Array<Failure>) => {
        if (pass.showErrors()) {
            failures.forEach(failure => console.log(failure));
        }
    };

    return {
        "line": line,
        "final": final
    }
};

export type Output = ReturnType<typeof output>;
