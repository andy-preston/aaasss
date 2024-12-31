import type { Failure } from "../failure/failures.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import { messages } from "./messages/english.ts";

export type FailureMessage = (line: LineWithObjectCode) => Array<string>;

export const defaultFailureMessages = (
    failure: Failure, line: LineWithObjectCode
) => messages[failure.kind](line);

export type FailureMessageTranslator = typeof defaultFailureMessages;
