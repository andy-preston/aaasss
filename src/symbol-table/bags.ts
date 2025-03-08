import type { NumberBag, StringBag } from "../assembler/bags.ts";
import type { BaggedDirective } from "../directives/bags.ts";

export type SymbolBag = NumberBag | StringBag | BaggedDirective;
