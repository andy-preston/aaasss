import { CodeLine } from "../coupling/line.ts";
import { Pass } from "../state/pass.ts";

export const output = (pass: Pass) => (line: CodeLine) => {
    if (pass.showErrors()) {
        console.log(line);
    }
};
