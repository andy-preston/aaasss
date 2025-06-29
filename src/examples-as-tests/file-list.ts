import type { FileName } from "../source-code/data-types.ts";

import { existsSync } from "jsr:@std/fs/exists";

const tempPath = (file: FileName) => `/var/tmp/${file}`;

export const fileList = () => {
    const list: Array<FileName> = ["demo.lst", "demo.hex"];

    const add = (directory: string, file: FileName) => {
        Deno.copyFileSync(`${directory}/${file}`, tempPath(file));
        list.push(file);
    };

    const cleanup = () => list.forEach(file => {
        if (existsSync(tempPath(file))) {
            Deno.removeSync(tempPath(file));
        }
    });

    return {"add": add, "cleanup": cleanup};
}