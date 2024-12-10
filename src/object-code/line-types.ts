import type { Failures } from "../coupling/value-failure.ts";
import type { Code } from "./data-types.ts";
import type { NumericOperands } from "../operands/data-types.ts";
import type {
    LineWithPokedBytes, PropertiesForPokedBytes
} from "../program-memory/line-types.ts";
import type { Line } from "../coupling/line.ts";

export type PropertiesForObjectCode
    = PropertiesForPokedBytes | "numericOperands";

export type LineWithObjectCode = Readonly<Pick<Line, PropertiesForObjectCode>>;

export const lineWithObjectCode = (
    line: LineWithPokedBytes, numeric: NumericOperands, code: Code,
    failures: Failures
) => {
    (line as Line).numericOperands = numeric;
    if (code.length > 0) {
        (line as Line).code.push(code);
    }
    line.addFailures(failures);
    return line as LineWithObjectCode;
};
