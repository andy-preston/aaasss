import { coupling } from "./coupling/coupling.ts";
import { passes } from "./state/pass.ts";

const coupled = coupling();
for (const passNumber of passes) {
    coupled.pass.start(passNumber);
    for (const line of coupled.lines("test1.asm")) {
        coupled.pipeline(line);
    }
}
