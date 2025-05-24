import type { PipelineSink, PipelineSource, PipelineStage } from "./data-types.ts";

import { passes } from "./data-types.ts";

export const assemblyPipeline = (
    source: PipelineSource,
    stages: Array<PipelineStage>, sinks: Array<PipelineSink>
) => {
    passes.forEach(pass => source(pass).forEach(line => {
        stages.forEach(stage => stage(line));
        if (line.isPass(2)) {
            sinks.forEach(sink => sink.line(line));
        }
    }));
    sinks.forEach(sink => sink.close());
};
