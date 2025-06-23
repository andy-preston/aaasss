import { docTest, expectFileContents, expectFileExists } from "./doc-test.ts";
import { defaultTomlLoader } from "../device/file.ts";
import { existsSync } from "jsr:@std/fs/exists";

const textFile = (name: string) => Deno.readTextFileSync(name).split("\n");

const titleCase = (title: string) => title.replaceAll(
    "--", ", "
).replaceAll(
    "-", " "
).split(
    " "
).map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
).join(
    " "
);

const sectionContents = (dir: string) => Deno.readDirSync(dir).filter(
    example => example.isDirectory
).map (
    example => example.name
).toArray().sort();

const demoContents = (dir: string) => Deno.readDirSync(dir).map (
    file => file.name
).toArray().sort();

let filterIndex = 0;
const root = import.meta.url.split('/').slice(2, -3).join('/');
["programs", "directives", "instructions"].forEach(section => {
    const sectionDir = `${root}/example/${section}`;
    sectionContents(sectionDir).forEach(example => {
        filterIndex = filterIndex + 1;
        Deno.test(titleCase(`${section}: ${example} [${filterIndex}]`), () => {
            const directory = `${sectionDir}/${example}`;
            const demo = docTest();
            demoContents(directory).forEach(file => {
                if (["demo.lst", "demo.hex"].includes(file)) {
                    return;
                }
                if (file.endsWith(".asm") || file.endsWith(".js")) {
                    demo.source(
                        file == "demo.asm" ? "" : file,
                        textFile(`${directory}/${file}`)
                    );
                    return;
                }
                if (file == "mock-unsupported-device.toml") {
                    demo.mockUnsupportedDevice(
                        defaultTomlLoader(`${directory}/${file}`)
                    );
                    return;
                }
                throw new Error(`weird file ${file} in example directory`);
            });
            demo.assemble();
            expectFileContents(".lst").toEqual(
                textFile(`${directory}/demo.lst`)
            );
            const hexFile = `${directory}/demo.hex`;
            if (existsSync(hexFile)) {
                expectFileContents(".hex").toEqual(textFile(hexFile));
            } else {
                expectFileExists(".hex").toBe(false);
            }
        });
    });
});
