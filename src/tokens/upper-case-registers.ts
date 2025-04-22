const registerName = /^r\d{1,2}$/;
const indexRegisterName = /^\+?[xyz]\+?$/;

const isRegister = (operand: string) =>
    operand.match(registerName) != null
        || operand.match(indexRegisterName) != null;

export const upperCaseRegisters = (operand: string) =>
    isRegister(operand) ? operand.toUpperCase() : operand;
