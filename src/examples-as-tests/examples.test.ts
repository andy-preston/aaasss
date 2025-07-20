import type { FileExtension } from "../assembler/output-file.ts";

import { expect } from "jsr:@std/expect/expect";
import { existsSync } from "jsr:@std/fs/exists";
import { defaultTomlLoader } from "../device/file.ts";
import { assembler } from "./assembler.ts";
import { fileList } from "./file-list.ts";

const textFile = (name: string) => Deno.readTextFileSync(name).split("\n");

const expectFileExists = (extension: FileExtension) => {
    const file = `/var/tmp/demo${extension}`;
    return expect(existsSync(file), `File ${file} exists`);
};

const expectFileContents = (extension: FileExtension) => {
    expectFileExists(extension).toBe(true);
    const contents = Deno.readTextFileSync(
        `/var/tmp/demo${extension}`
    ).split("\n");
    contents.pop();
    return expect(contents);
};

const demo = (directory: string) => {
    const demo = assembler();
    const tempFiles = fileList();
    Deno.readDirSync(directory).map(
        file => file.name
    ).toArray().sort().forEach(file => {
        if (file.endsWith(".asm") || file.endsWith(".js")) {
            tempFiles.add(directory, file)
        }
        if (file == "mock-unsupported-device.toml") {
            demo.mockUnsupportedDevice(
                defaultTomlLoader(`${directory}/${file}`)
            );
        }
    });

    demo.assemble('/var/tmp/demo.asm');

    expectFileContents(".lst").toEqual(textFile(`${directory}/demo.lst`));
    const hexFile = `${directory}/demo.hex`;
    if (existsSync(hexFile)) {
        expectFileContents(".hex").toEqual(textFile(hexFile));
    } else {
        expectFileExists(".hex").toBe(false);
    }

    tempFiles.cleanup();
};

const root = import.meta.url.split('/').slice(2, -3).join('/');

let filterIndex = 0;
["programs", "directives", "instructions"].forEach(section => {
    const sectionSubDir = `examples/${section}`;
    const sectionDir = `${root}/${sectionSubDir}`;
    Deno.readDirSync(sectionDir).filter(
        example => example.isDirectory
    ).map (
        example => example.name
    ).toArray().sort().forEach(example => {
        filterIndex = filterIndex + 1;
        const title = `${sectionSubDir}/${example} [${filterIndex}]`;
        Deno.test(title, () => {
            demo(`${sectionDir}/${example}`);
        });
    });
});
