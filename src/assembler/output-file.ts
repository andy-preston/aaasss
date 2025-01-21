import { existsSync } from "fs/exists";
import { FileName } from "../source-code/data-types.ts";

export type FileExtension = ".lst" | ".hex";

const encoder = new TextEncoder();

export const extensionSwap = (fileName: FileName, extension: FileExtension) =>
    fileName.substring(0, fileName.lastIndexOf(".")) + extension;

export const outputFile = (topFileName: string, extension: FileExtension) => {
    let theFile: Deno.FsFile | undefined;

    const fileName = extensionSwap(topFileName, extension);

    const open = () => {
        theFile = Deno.openSync(
            fileName,
            { create: true, write: true, truncate: true }
        );
    };
    const remove = () => {
        if (existsSync(fileName())) {
            Deno.removeSync(fileName());
        }
    };
    const write = (text: string) => {
        if (theFile == undefined) {
            open();
        }
        theFile!.writeSync(encoder.encode(`${text}\n`));
    };
    const close = () => {
        if (theFile != undefined) {
            theFile.close();
        }
    };
    return {
        "remove": remove,
        "write": write,
        "close": close
    };
};

export type OutputFile = typeof outputFile;
