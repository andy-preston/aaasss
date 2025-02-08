const pattern = /^[XYZ]\+/;

export const indexRegisterWithPlus = (operand: string) => {
    const match = operand.toUpperCase().match(pattern);
    return match == null ? "" : match[0];
};
