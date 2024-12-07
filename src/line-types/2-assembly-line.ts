import type { Failures } from "../coupling/value-failure.ts";
import { SourceCode } from "../source-code/data-types.ts";
import type { Line } from "./0-line.ts";
import type { RawLine, RawProperties } from "../source-code/raw-line.ts";

export type AssemblyProperties = RawProperties | "assemblySource";

export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: SourceCode,
    failures: Failures
): AssemblyLine => {
    (line as Line).assemblySource = source;
    line.addFailures(failures);
    return line as AssemblyLine;
};
