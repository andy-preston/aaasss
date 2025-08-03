import type { Failure } from "../failure/bags.ts";

import { messages } from "./english.ts";

export type FailureMessage = (failure: Failure) => Array<string>;

export const defaultFailureMessages = (failure: Failure) =>
    messages[failure.kind](failure);

export type FailureMessageTranslator = typeof defaultFailureMessages;

export const withLocation = (failure: Failure, messages: Array<string>) =>
        failure.location != undefined && "operand" in failure.location
        ? messages.concat([`operand: ${failure.location.operand}`])

        : failure.location != undefined && "parameter" in failure.location
        ? messages.concat([`parameter: ${failure.location.parameter}`])

        : messages;
