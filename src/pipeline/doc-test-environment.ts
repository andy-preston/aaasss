import { box } from "../coupling/boxed-value.ts";
import { coupling } from "../coupling/coupling.ts";
import type { Failure } from "../failure/failures.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { FileName } from "../source-code/data-types.ts";

export const testEnvironment = () => {
    let source: Array<string> = [];
    let deviceSpec: object = {};

    const output: Map<string, Array<string>> = new Map();

    const mockFileReader = (_fileName: FileName) => source;

    const addSourceCode = (text: Array<string>) => {
        source = text;
        return environment;
    };

    const mockDeviceFinder = (name: string) => box(name);

    const mockDeviceReader = (_fileName:string) => deviceSpec;

    const addDeviceSpec = (spec: object) => {
        deviceSpec = { "spec": spec };
        return environment;
    }

    const mockOutputFile = (_fileName: string, extension: string) => {
        let theText: Array<string> = [];
        const write = (text: string) => {
            theText.push(text);
        };
        const close = () => {
            if (theText.length > 0) {
                if (output.has(extension)) {
                    throw new Error(`Multiple ${extension} files created`);
                }
                output.set(extension, theText);
            }
            theText = [];
        };
        return {
            "write": write,
            "close": close,
            "remove": () => {}
        };
    };

    const mockFailureMessages =
        (failure: Failure, _line: LineWithObjectCode) => [failure.kind];

    const environment = {
        "source": addSourceCode,
        "deviceSpec": addDeviceSpec,
        "pipeline": coupling(
            "mock.asm", mockFileReader, mockOutputFile, mockFailureMessages,
            mockDeviceFinder, mockDeviceReader
        ),
        "listing": () => output.get(".lst"),
        "hexFile": () =>  output.get(".hex")
    };

    return environment;
};
