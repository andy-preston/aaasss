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

const dirContents = (dir: string) => Deno.readDirSync(dir).filter(
    example => example.isDirectory
).map (
    example => example.name
).toArray().sort();

const root = import.meta.url.split('/').slice(2, -3).join('/');
["programs", "instructions"].forEach(section => {
    const sectionDir = `${root}/example/${section}`;
    dirContents(sectionDir).forEach(example => {
        const directory = `${sectionDir}/${example}`;
        Deno.test(titleCase(`${section}: ${example}`), () => {
            const demo = docTest();
            demo.source(
                "", textFile(`${directory}/demo.asm`)
            );
            const mockDevice = `${directory}/mock-unsupported-device.toml`;
            if (existsSync(mockDevice)) {
                demo.mockUnsupportedDevice(defaultTomlLoader(mockDevice));
            }
            demo.assemble();
            expectFileContents(".lst").toEqual(textFile(`${directory}/demo.lst`));
            const hexFile = `${directory}/demo.hex`;
            if (existsSync(hexFile)) {
                expectFileContents(".hex").toEqual(textFile(hexFile));
            } else {
                expectFileExists(".hex").toBe(false);
            }
        });
    });
});
