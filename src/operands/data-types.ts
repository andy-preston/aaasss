export type OperandIndex = 0 | 1 | 2;

type Operands<Type> =
    readonly [] |
    readonly [Type] |
    readonly [Type, Type] |
    readonly [Type, Type, Type];

export type SymbolicOperand = string;
export type SymbolicOperands = Operands<SymbolicOperand>;

export type NumericOperand = number | undefined;
export type NumericOperands = Operands<NumericOperand>;

export type OperandType = "index_offset" | "register" | "number";
export type OperandTypes = Operands<OperandType>;

type Lookup<Goal> =
    Goal extends SymbolicOperands ? SymbolicOperand :
    Goal extends NumericOperands ? NumericOperand :
    OperandType;

export const operands = <
    Goal extends SymbolicOperands | NumericOperands | OperandTypes
> (operands: Array<Lookup<Goal>>) => {
    if (operands.length > 3) {
        throw Error("More than 3 operands isn't possible");
    }
    return operands as unknown as Goal;
};
