export type SpecItems = Record<string, number | boolean | Array<string>>;

export type DeviceSpec = { "family"?: string; "spec": SpecItems };
