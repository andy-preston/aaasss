import type { Javascript } from "../javascript/embedded/javascript.ts";
import type { IllegalState } from "../failure/illegal-state.ts";
import type { HexFile } from "../hex-file/hex.ts";
import type { Listing } from "../listing/listing.ts";
import { lineWithNoObjectCode } from "../macro/line-types.ts";
import type { MacroProcessor } from "../macro/processor.ts";
import type { ObjectCode } from "../object-code/object-code.ts";
import type { PokeBuffer } from "../program-memory/poke.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import type { Tokenise } from "../tokens/tokenise.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { type Pass, passes } from "./pass.ts";

export type PipelineSource = () => Generator<LineWithRawSource, void, void>;

export const pipeLine = (
    pass: Pass,
    lines: PipelineSource,
    javascript: Javascript["rendered"],
    tokenise: Tokenise,
    macro: MacroProcessor["lines"],
    label: ProgramMemory["label"],
    poke: PokeBuffer["line"],
    code: ObjectCode,
    listing: Listing,
    hex: HexFile,
    illegalState: IllegalState
) => {
    const assembly = (tokenised: LineWithTokens) => {
        for (const expanded of macro(tokenised)) {
            const outputLine = expanded.macroName == ""
                ? code(poke(label(expanded)))
                : lineWithNoObjectCode(expanded);
            if (outputLine.lastLine) {
                illegalState(outputLine.withFailure);
            }
            if (pass.produceOutput()) {
                listing.line(outputLine);
                hex.line(outputLine);
            }
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
