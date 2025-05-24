import type { Line } from "../line/line-types.ts";

export const passes = [1, 2] as const;
export type Pass = typeof passes[number];

export type PipelineSource = (pass: Pass) => Generator<Line, void, void>;

export type PipelineStage = (line: Line) => void;

export type PipelineSink = {"line": PipelineStage, "close": () => void};
