import type { IllegalState } from "../failure/illegal-state.ts";
import type { HexFile } from "../hex-file/hex.ts";
import type { Javascript } from "../javascript/embedded/embedded.ts";
import type { Listing } from "../listing/listing.ts";
import { lineWithNoObjectCode, LineWithProcessedMacro } from "../macro/line-types.ts";
import type { MacroProcessor } from "../macro/processor.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { SymbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { SourceOfSource } from "../source-code/file-stack.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import type { Tokenise } from "../tokens/tokenise.ts";
import { passes, type Pass, type PassNumber } from "./pass.ts";

export const assemblyPipeline = (
    pass: Pass,
    lines: SourceOfSource,
    javascript: Javascript["rendered"],
    tokenise: Tokenise,
    macro: MacroProcessor["lines"],
    operands: SymbolicToNumeric,
    code: ObjectCode,
    addressed: ProgramMemory["addressed"],
    listing: Listing,
    hex: HexFile,
    illegalState: IllegalState
) => {
    const output = (line: LineWithAddress) => {
        if (!pass.produceOutput()) {
            return;
        }
        if (line.lastLine) {
            illegalState(line.withFailure);
        }
        listing.line(line);
        hex.line(line);
    };

    const expandedOutput = (line: LineWithProcessedMacro) => {
        const withObjectCode = line.macroBeingDefined()
            ? lineWithNoObjectCode(line)
            : code(operands(line));
        output(addressed(withObjectCode));
    };

    const sourceLine = (line: LineWithRawSource) => {
        macro(tokenise(javascript(line))).forEach(expandedOutput);
    }

    const allSource = (passNumber: PassNumber) => {
        pass.start(passNumber);
        lines().forEach(sourceLine);
    };

    return () => {
        passes.forEach(allSource);
        listing.close();
        hex.save();
    };
};
