export type SymbolicOperand = string;

export type SymbolicOperands =
    readonly [] |
    readonly [SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand, SymbolicOperand];

export type NumericOperand = number | undefined;

export type NumericOperands =
    readonly [] |
    readonly [NumericOperand] |
    readonly [NumericOperand, NumericOperand] |
    readonly [NumericOperand, NumericOperand, NumericOperand];

export type OperandIndex = 0 | 1 | 2;

export const operands = <Goal extends SymbolicOperands | NumericOperands>(
    operands: Array<
        Goal extends SymbolicOperands ? SymbolicOperand : NumericOperand
    >
) => {
    if (operands.length > 3) {
        throw Error("More than 3 operands isn't possible");
    }
    return operands as unknown as Goal;
}
