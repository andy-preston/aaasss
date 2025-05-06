type Value = string | boolean | Array<string>;

type Item = { "description"?: string, "value": Value };

type Spec = Record<string, Item>;

type DeviceSpec = { "family": string, "spec": Spec };

const encoder = new TextEncoder();

const value = (input: Value) => {
    if (Array.isArray(input)) {
        return `[${input.map(value => `"${value}"`).join(", ")}]`;
    }
    if (typeof input == "boolean") {
        return input ? "true" : "false";
    }
    if (input.match(/^[0-9A-F]*$/) !== null) {
        if (input.length > 4) {
            throw new Error("hex is too big");
        }
        return input.length > 2
            ? `0x${input.padStart(4, "0")}`
            : `0x${input.padStart(2, "0")}`;
    }
    return `${input}`;
};

const spec = (output: Array<string>, input: Spec) => {
    for (const key in input) {
        const valueObject = input[key]!;
        if (Object.hasOwn(valueObject, "description")) {
            output.push("");
            output.push(`# ${valueObject.description}`);
        }
        output.push(`${key} = ${value(valueObject.value)}`);
    }
    return output;
}

const device = (output: Array<string>, input: DeviceSpec) => {
    output.push(`family = "${input.family}"`);
    output.push("");
    output.push("[spec]");
    return spec(output, input.spec);
};

const convert = (fileName: string) => {
    const input = JSON.parse(Deno.readTextFileSync(fileName));
    const output: Array<string> =
        Object.hasOwn(input, "family") && Object.hasOwn(input, "spec")
            ? device([], input)
            : spec([], input);
    const toml = output.join("\n");
    const tomlName = fileName.substring(0, fileName.lastIndexOf(".")) + ".toml";
    Deno.writeFileSync(tomlName, encoder.encode(toml));
};

Deno.args.forEach(convert);
