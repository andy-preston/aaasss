import { emptyBag, numberBag, stringBag, type NumberBag, type StringBag } from "../assembler/bags.ts";
import type { BaggedDirective, ValueDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { oldFailure, bagOfFailures, type StringOrFailures, type BagOfFailures } from "../failure/bags.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { FileName, LineNumber } from "../source-code/data-types.ts";


type SymbolBag = StringBag | NumberBag | BaggedDirective;

export const symbolTable = (cpuRegisters: CpuRegisters) => {

    const functions: Map<string, BaggedDirective> = new Map();

    const primitives: Map<string, string | number> = new Map();

    const metadata: Map<string, [number, string]> = new Map();

    const resetState = () => {
        functions.clear();
        metadata.clear();
    };

    const initialMetadata = (
        symbolName: string, fileName: FileName, lineNumber: LineNumber
    ) => {
        metadata.set(symbolName, [0, `${fileName}:${lineNumber}`]);
    };

    const incrementedCount = (symbolName: string) => {
        const record = metadata.get(symbolName);
        if (record != undefined) {
            record[0] = record[0] + 1;
        }
    }

    const alreadyExists = (symbolName: string, value: unknown): StringOrFailures =>
        (primitives.has(symbolName) && primitives.get(symbolName) != value)
        || functions.has(symbolName)
        ? bagOfFailures([oldFailure("symbol_alreadyExists", undefined)])
        : emptyBag()

    const addFunction = (
        symbolName: string, bag: BaggedDirective,
        fileName: FileName,  lineNumber: LineNumber
    ): DirectiveResult => {
        const exists = alreadyExists(symbolName, bag);
        if (exists.type == "failures") {
            return exists;
        }
        functions.set(symbolName, bag);
        if (fileName != "") { // directives won't have a filename
            initialMetadata(symbolName, fileName, lineNumber);
        }
        return emptyBag();
    };

    const defineDirective: ValueDirective = {
        "type": "valueDirective",
        "it": (symbolName: string, value: number) => add(
            symbolName, value, currentFileName(), currentLineNumber()
        )
    };

    const add = (
        symbolName: string, value: string | number,
        fileName: FileName, lineNumber: LineNumber
    ): DirectiveResult => {
        const exists = alreadyExists(symbolName, value);
        if (exists.type == "failures") {
            return exists;
        }
        primitives.set(symbolName, value);
        initialMetadata(symbolName, fileName, lineNumber);
        return emptyBag();
    };

    const use = (
        symbolName: string
    ): StringBag | NumberBag | BaggedDirective | BagOfFailures => {
        if (functions.has(symbolName)) {
            incrementedCount(symbolName);
            return functions.get(symbolName)!;
        }
        if (primitives.has(symbolName)) {
            incrementedCount(symbolName);
            const value = primitives.get(symbolName)!;
            return typeof value == "string"
                ? stringBag(value)
                : numberBag(value);
        }
        return bagOfFailures([oldFailure("symbol_notFound", undefined)]);
    };

    const list = () => {
        const asArray: Array<[
            string,
            number,
            string | number | undefined,
            string
        ]> = [];
        metadata.forEach(([count, definition], symbolName) => {
            asArray.push([
                symbolName,
                count,
                functions.has(symbolName)
                    ? ""
                    : `${primitives.get(symbolName)!}`,
                definition
            ]);
        });
        return asArray;
    }






/*
    const has = (
        symbolName: string, option: "includingRegisters" | "notRegisters"
    ) => {
        const isRegister = cpuRegisters.has(symbolName);
        const hasSymbol = values.has(symbolName)
            || macroList.has(symbolName)
            || directiveList.has(symbolName)
            || deviceProperties.has(symbolName);
        return hasSymbol && (
            (option == "includingRegisters" || isRegister)
            || (option == "notRegisters" && !isRegister)
        );
    };


    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };


    const use = (
        symbolName: string
    ): StringBag | NumberBag | BaggedDirective => {
        if (directiveList.has(symbolName)) {
            return directiveList.use(symbolName);
        }

        if (macroList.has(symbolName)) {
            increment(symbolName);
            return macroList.use(symbolName, count(symbolName));
        }

        if (values.has(symbolName)) {
            increment(symbolName);
            return values.get(symbolName)!;
        }

        const property = deviceProperties.value(symbolName);
        if (property.type == "string") {
            increment(symbolName);
            return property;
        }

        increment(symbolName);
        return numberBag(cpuRegisters.value(symbolName));
    };

    const notCounted = (symbolName: string) => values.get(symbolName)!;


    const diagnostic = (symbolName: string) => {
        const property = deviceProperties.value(symbolName);
        return `${symbolName}: ` + (
            property.type == "string"
            ? "device property"
            : macroList.has(symbolName)
            ? "Macro"
            : cpuRegisters.has(symbolName)
            ? "CPU register"
            : values.get(symbolName)!.type
        );
    };

    */

    return {
        //"has": has,
        "add": add,
        "addFunction": addFunction,
        "use": use,
        //"notCounted": notCounted,
        //"diagnostic": diagnostic,
        //"count": count,
        "list": list,
        "resetState": resetState,
        "defineDirective": defineDirective,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
