import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { ImmutableLine } from "./line.ts";

type Pipe = IterableIterator<ImmutableLine, void, undefined>;
type Source = () => Pipe;
type Stage = (pipe: Pipe) => Pipe;
type Sink = {
    "line": (line: LineWithAddress) => void;
    "close": () => void;
};

export const assemblyPipeline = (source: Source) => {
    let pipe : Pipe = source();

    const results = (...output: Array<Sink>) => {
        for (const pass of [1, 2]) {
            for (const line of pipe) {
                if (pass == 2) {
                    output.forEach(sink => sink.line(line));
                }
            }
        }
        output.forEach(sink => sink.close());
    };

    const andThen = (stage: Stage) => {
        pipe = stage(pipe);
        return pipeline;
    };

    const pipeline = { "results": results, "andThen": andThen };

    return pipeline;
};
