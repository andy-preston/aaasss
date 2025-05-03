import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { Pass, Pipe } from "./data-types.ts";

import { passes } from "./data-types.ts";

type Source = (pass: Pass) => Pipe;
type Stage = (pipe: Pipe) => Pipe;
type Sink = {
    "line": (line: LineWithAddress) => void;
    "close": () => void;
};

export const assemblyPipeline = (source: Source) => {
    const twoPasses = function* () {
        for (const pass of passes) {
            yield* source(pass);
        }
    };

    let pipe : Pipe = twoPasses();

    const results = (...output: Array<Sink>) => () => {
        for (const line of pipe) {
            if (line.isPass(2)) {
                output.forEach(sink => sink.line(line));
            }
        }
        output.forEach(sink => sink.close());
    };

    const andThen = (stage: Stage) => {
        pipe = stage(pipe);
        return pipeline;
    };

    const pipeline = { "andThen": andThen, "results": results };

    return pipeline;
};
