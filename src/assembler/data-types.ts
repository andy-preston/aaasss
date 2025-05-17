import type { ImmutableLine } from "../line/line-types.ts";

export const passes = [1, 2] as const;
export type Pass = typeof passes[number];

export type Pipe = IterableIterator<ImmutableLine, void, undefined>;
