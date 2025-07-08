const commaNotInParentheses = /,(?![^\(]*[\)])/g;

const registerName = /^r\d{1,2}$/;

const indexRegisterWord = /^\+?[xyz]\+?$/;

const indexRegisterByte = /^[xyz][hl]$/i;

const isRegister = (operand: string) =>
    operand.match(registerName) != null
        || operand.match(indexRegisterWord) != null
        || operand.match(indexRegisterByte) != null;

export const operands = (text: string): Array<string> =>
    text == "" ? [] : text.split(
        commaNotInParentheses
    ).map((piece) => {
        const operand = piece.trim();
        return isRegister(operand) ? operand.toUpperCase() : operand;
    });
