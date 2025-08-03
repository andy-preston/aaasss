import type { PipelineSink } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { OutputFile } from "../assembler/output-file.ts";
import type { FileName } from "../source-code/data-types.ts";

import { highByte, lowByte } from "../directives/function-directives.ts";
import { hexBuffer } from "./hex-buffer.ts";

const dataRecordType = "00";

const hex = (value: number, digits: number) =>
    value.toString(16).toUpperCase().padStart(digits, "0");

const hexRecord = (address: number, bytes: Array<number>) => {
    const checksum = () => {
        // https://en.wikipedia.org/wiki/Intel_HEX
        const total = bytes.reduce(
            (total, byte) => total + byte,
            bytes.length
                + (lowByte(address) as number)
                + (highByte(address) as number)
        );
        return 0x0100 - (lowByte(total) as number);
    };

    return [
        ":",
        hex(bytes.length, 2), // usually 8, 16 or 32 some warez don't like 32
        hex(address, 4),      // for > 64K use extended segment address
        dataRecordType,
        bytes.map(byte => hex(byte, 2)).join(""),
        hex(checksum(), 2)
    ].join("");
};

const programMemoryAddressInBytes = (programMemoryAddress: number): number =>
    programMemoryAddress * 2;

export const hexFile = (
    currentLine: CurrentLine,
    outputFile: OutputFile, topFileName: FileName
): PipelineSink => {
    const dataRecords: Array<string> = [];
    const buffer = hexBuffer();
    let noHexFile: boolean = false;

    const line = () => {
        if (currentLine().failures().length > 0) {
            noHexFile = true;
        }
        const newAddress = programMemoryAddressInBytes(
            currentLine().address
        );
        if (!buffer.isContinuous(newAddress)) {
            saveRecordsFromByteBuffer(1);
            buffer.restartAt(newAddress);
        }
        for (const block of currentLine().code) {
            buffer.add(block);
        }
        saveRecordsFromByteBuffer(16);
    };

    const saveRecordsFromByteBuffer = (minimumRecordSize: 1 | 16) => {
        while (buffer.hasAtLeast(minimumRecordSize)) {
            const record = hexRecord(buffer.address(), buffer.someBytes());
            dataRecords.push(record);
        }
    };

    const close = () => {
        const file = outputFile(topFileName, '.hex');
        if (noHexFile) {
            file.remove();
            return;
        }

        saveRecordsFromByteBuffer(1);
        if (dataRecords.length == 0) {
            return;
        }

        file.write(":020000020000FC");
        dataRecords.forEach(file.write);
        file.write(":00000001FF");
        file.close();
    };

    return { "line": line, "close": close };
}

export type HexFile = ReturnType<typeof hexFile>;
