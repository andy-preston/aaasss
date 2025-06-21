import type { PipelineProcess, PipelineReset, PipelineSink, PipelineSource } from "./data-types.ts";

import { passes } from "./data-types.ts";

export const assemblyPipeline = (
    source: PipelineSource,
    processes: Array<PipelineProcess>, sinks: Array<PipelineSink>,
    resets: Array<PipelineReset>
) => {
    passes.forEach((pass) => {
        const eachLine = () => {
            processes.forEach(process => process());
            if (pass == 2) sinks.forEach(sink => sink.line());
        };
        const atEnd = () => {
            resets.forEach(reset => reset(pass));
            if (pass == 2) sinks.forEach(sink => sink.close());
        }
        source(eachLine, atEnd);
    });
};
