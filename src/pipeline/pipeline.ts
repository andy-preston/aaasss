import type { IllegalState } from "../failure/illegal-state.ts";
import type { HexFile } from "../hex-file/hex.ts";
import type { Javascript } from "../javascript/embedded/embedded.ts";
import type { Listing } from "../listing/listing.ts";
import { lineWithNoObjectCode } from "../macro/line-types.ts";
import type { MacroProcessor } from "../macro/processor.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { SymbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import type { Tokenise } from "../tokens/tokenise.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { passes, type Pass } from "./pass.ts";

export type PipelineSource = () => Generator<LineWithRawSource, void, void>;

export const pipeLine = (
    pass: Pass,
    lines: PipelineSource,
    javascript: Javascript["rendered"],
    tokenise: Tokenise,
    macro: MacroProcessor["lines"],
    label: ProgramMemory["label"],
    operands: SymbolicToNumeric,
    code: ObjectCode,
    listing: Listing,
    hex: HexFile,
    illegalState: IllegalState
) => {
    const output = (line: LineWithObjectCode) => {
        if (!pass.produceOutput()) {
            return;
        }
        if (line.lastLine) {
            illegalState(line.withFailure);
        }
        listing.line(line);
        hex.line(line);
    };

    const assembly = (line: LineWithTokens) => {
        for (const expanded of macro(line)) {
            const outputLine: LineWithObjectCode =
                expanded.macroName == ""
                    ? code(operands(label(expanded)))
                    : lineWithNoObjectCode(expanded);
            output(outputLine);
        }
    };

    return () => {
        for (const passNumber of passes) {
            pass.start(passNumber);
            for (const line of lines()) {
                assembly(tokenise(javascript(line)));
            }
        }
        listing.close();
        hex.save();
    };
};
