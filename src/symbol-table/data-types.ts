import { ActualParametersDirective } from "../directives/data-types.ts";

export type UserFunction = ActualParametersDirective["method"];

export type UsageCount = number;

export type SymbolValue = number | string | UserFunction;

export type MapEntry = [UsageCount, SymbolValue];
