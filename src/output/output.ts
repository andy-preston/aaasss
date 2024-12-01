import { CodeLine } from "../coupling/line.ts";
import { Pass } from "../pass/pass.ts";
import { Failure } from "../value-or-failure.ts";

export const output = (pass: Pass) => {

    const line = (line: CodeLine) => {
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
