import type { Line } from "../line/line-types.ts";
import type { Pass, Pipe } from "./data-types.ts";

import { passes } from "./data-types.ts";

type Source = (pass: Pass) => Pipe;

export type Stage = (line: Line) => void;

type Sink = {"line": Stage, "close": () => void};

export const assemblyPipeline = (source: Source) => {
    const stages: Array<Stage> = [];

    const results = (...sinks: Array<Sink>) => () => {
        passes.forEach(pass => source(pass).forEach(line => {
            stages.forEach(stage => stage(line));
            if (line.isPass(2)) {
                sinks.forEach(sink => sink.line(line));
            }
        }));
        sinks.forEach(sink => sink.close());
    };

    const andThen = (stage: Stage) => {
        stages.push(stage);
        return pipeline;
    };

    const pipeline = {"andThen": andThen, "results": results};

    return pipeline
};
