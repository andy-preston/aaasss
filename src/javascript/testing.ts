import { symbolTable } from "../listing/symbol-table.ts";
import { anEmptyContext } from "./context.ts";

export const testContext = () => anEmptyContext(symbolTable());
