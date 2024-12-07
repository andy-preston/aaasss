import type { Failures } from "../coupling/value-failure.ts";
import type { Code } from "../object-code/data-types.ts";
import type { NumericOperands } from "../operands/data-types.ts";
import type { Line } from "./0-line.ts";
import type { PokedLine, PokedProperties } from "./5-poked-line.ts";

export type CodeProperties = PokedProperties | "numericOperands";

export type CodeLine = Readonly<Pick<Line, CodeProperties>>;

export const codeLine = (
    line: PokedLine,
    numeric: NumericOperands,
    code: Code,
    failures: Failures
): CodeLine => {
    (line as Line).numericOperands = numeric;
    if (code.length > 0) {
        (line as Line).code.push(code);
    }
    line.addFailures(failures);
    return line as CodeLine;
};
