import type { DiscreteType } from "../assembler/data-types.ts";
import type { BaggedDirective } from "../directives/bags.ts";

export type SymbolValue = DiscreteType | BaggedDirective;
