import { pass } from "../assembler/pass.ts";
import { directiveList } from "../directives/directive-list.ts";
import { jSExpression } from "../javascript/expression.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const systemUnderTest = () => {
    const device = deviceProperties();
    const registers = cpuRegisters();
    const directives = directiveList();
    const symbols = symbolTable(directives, device.public, registers, pass());
    const chooser = deviceChooser(
        device, registers, [defaultDeviceFinder, defaultJsonLoader]
    );
    directives.includes("device", chooser.deviceDirective);
    return {
        "deviceProperties": device,
        "deviceChooser": chooser,
        "jSExpression": jSExpression(symbols)
    };
}

