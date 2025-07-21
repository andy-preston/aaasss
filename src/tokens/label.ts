import { boringFailure } from "../failure/bags.ts";

const validLabel = /^\w*$/;

export const badLabel = (label: string) =>
    validLabel.test(label) ? undefined : boringFailure("syntax_invalidLabel");
