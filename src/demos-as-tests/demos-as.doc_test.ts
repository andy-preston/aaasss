import { docTest, expectFileContents } from "./doc-test.ts";
import { defaultTomlLoader } from "../device/file.ts";
import { existsSync } from "jsr:@std/fs/exists";

const textFile = (name: string) => Deno.readTextFileSync(name).split("\n");

const root = import.meta.url.split('/').slice(2, -3).join('/');
["programs", "instructions"].forEach(section => {
    const sectionDir = `${root}/example/${section}`;
    Deno.readDirSync(sectionDir).forEach(example => {
        const directory = `${sectionDir}/${example.name}`;
        Deno.test(`${example.name} example`, () => {
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
            expectFileContents(".hex").toEqual(textFile(`${directory}/demo.hex`));
        });
    });
});
