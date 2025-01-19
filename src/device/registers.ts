import type { Context } from "../javascript/context.ts";

export const cpuRegisters = (context: Context) => {
    const choose = (reducedCore: boolean) => {
        let register = reducedCore ? 16 : 0;
        while (register < 32) {
            context.define(`R${register}`, register++);
        }
        const specialRegisters: Array<[string, number]> = [
            ["X", 26],
            ["XL", 26],
            ["XH", 27],
            ["Y", 28],
            ["YL", 28],
            ["YH", 29],
            ["Z", 30],
            ["ZL", 30],
            ["ZH", 31],
        ];
        for (const [name, value] of specialRegisters) {
            context.define(name, value);
        }
    };

    return {
        "choose": choose,
    };
};

export type CpuRegisters = Readonly<ReturnType<typeof cpuRegisters>>;
