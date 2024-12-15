import { coupling } from "../src/coupling/coupling.ts";

const mockFileReader = (_path: string | URL): string => {
    return "dummy file contents";
};

export const mockOutputFile = (_fileName: string, _extension: string) => {
    const write = (text: string) => {
        console.log(text);
    };
    const close = () => {
        console.log("close");
    };
    return {
        "write": write,
        "close": close
    };
};

Deno.test({
    "name": "Dummy integration test",
    "ignore": Deno.args.includes("--no-integration"),
    fn() {
        const pipeline = coupling("file1.asm", mockFileReader, mockOutputFile);
        console.log(pipeline);
    }
});
