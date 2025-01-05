import type { Failure } from "../failure/failures.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import { messages } from "./english.ts";

export type FailureMessage = (line: LineWithAddress) => Array<string>;

export const defaultFailureMessages = (
    failure: Failure, line: LineWithAddress
) => messages[failure.kind](line);

export type FailureMessageTranslator = typeof defaultFailureMessages;
