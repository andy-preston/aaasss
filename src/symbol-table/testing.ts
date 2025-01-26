import { usageCount } from "./usage-count.ts";
import { anEmptyContext } from "./context.ts";

export const testContext = () => anEmptyContext(usageCount());
