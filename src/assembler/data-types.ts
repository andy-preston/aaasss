export type Min = number | undefined;
export type Max = number | undefined;
export type AllowedValues = Array<number> | undefined;

export const typeOf = (thingy: unknown) =>
    Array.isArray(thingy) ? "array" : typeof thingy;

export type DiscreteType = string | number;

export const isDiscrete = (thingy: unknown): thingy is DiscreteType =>
    ["string", "number"].includes(typeof thingy);

export const passes = [1, 2] as const;
export type Pass = typeof passes[number];

export type PipelineProcess = () => void;

export type PipelineReset = (pass: Pass) => void;

export type PipelineSource = (
    eachLine: PipelineProcess, atEnd: PipelineProcess
) => void;

export type PipelineSink = {"line": PipelineProcess, "close": PipelineProcess};
