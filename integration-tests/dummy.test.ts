import { assertEquals } from "assert";
import { testEnvironment } from "./environment.ts";

Deno.test({
    "name": "Dummy integration test",
    "ignore": Deno.args.includes("--no-integration"),
    "fn": () => {
        const environment = testEnvironment([
            "source line 1",
            "source line 2"
        ]);
        environment.pipeline();
        assertEquals(environment.listing(), [
            "mock.asm",
            "========",
            "",
            "                     1 source line 1",
            "                       mnemonic_supportedUnknown",
            "                     2 source line 2",
            "                       mnemonic_supportedUnknown",
        ]);
        assertEquals(environment.hexFile(), [
            "DEADBEEF"
        ]);
    }
});
