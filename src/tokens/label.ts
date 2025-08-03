import { boringFailure } from "../failure/failures.ts";

const validLabel = /^\w*$/;

export const badLabel = (label: string) =>
    validLabel.test(label) ? undefined : boringFailure("syntax_invalidLabel");
