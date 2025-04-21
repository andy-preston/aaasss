import type { IllegalState } from "../failure/illegal-state.ts";
import type { HexFile } from "../hex-file/hex.ts";
import type { EmbeddedJs } from "../javascript/embedded.ts";
import type { Listing } from "../listing/listing.ts";
import type { Macros } from "../macros/macros.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { SymbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { SourceOfSource } from "../source-code/file-stack.ts";
import type { Tokenise } from "../tokens/tokenise.ts";
import type { Pass, PassNumber } from "./pass.ts";

import { passes } from "./pass.ts";

export const assemblyPipeline = (
    pass: Pass,
    lines: SourceOfSource,
    embeddedJs: EmbeddedJs["rendered"],
    tokenise: Tokenise,
    macro: Macros["lines"],
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
            illegalState.check(line);
        }
        listing.line(line);
        hex.line(line);
    };

    const allSource = (passNumber: PassNumber) => {
        if (passNumber == 2) {
            pass.second();
        }
        lines().forEach(line =>
            output(addressed(code(operands(macro(tokenise(embeddedJs(line)))))))
        );
    };

    return () => {
        passes.forEach(allSource);
        listing.close();
        hex.save();
    };
};
