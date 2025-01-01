export const splitOperands = (text: string): Array<string> =>
    text == "" ? [] : text.split(",").map(operand => operand.trim());
