import { docTest, expectFileContents } from "./doc-test.ts";

const textFile = (name: string) => Deno.readTextFileSync(name).split("\n");

const root = import.meta.url.split('/').slice(2, -3).join('/');
const examples = `${root}/examples`;
Deno.readDirSync(examples).forEach(example => {
    const exampleDir = `${examples}/${example.name}`
    Deno.test(`${example.name} example`, () => {
        const demo = docTest();
        demo.source("", textFile(`${exampleDir}/demo.asm`));
        demo.assemble();
        expectFileContents(".lst").toEqual(textFile(`${exampleDir}/demo.lst`));
        expectFileContents(".hex").toEqual(textFile(`${exampleDir}/demo.hex`));
    });
});

