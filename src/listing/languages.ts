import type { Failure } from "../failure/bags.ts";

import { messages } from "./english.ts";

export type FailureMessage = (failure: Failure) => Array<string>;

export const defaultFailureMessages = (failure: Failure) =>
    messages[failure.kind](failure);

export type FailureMessageTranslator = typeof defaultFailureMessages;
