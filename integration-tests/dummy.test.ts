import { coupling } from "../src/coupling/coupling.ts";
import { outputFile } from "../src/output/file.ts";

Deno.test({
    "name": "Dummy integration test",
    "ignore": Deno.args.includes("--no-integration"),
    fn() {
        const pipeline = coupling(
            "file1.asm", Deno.readTextFileSync, outputFile
        );
        console.log(pipeline);
    },
});
