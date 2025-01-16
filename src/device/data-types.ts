export type FullSpec = Record<string, number | boolean | Array<string>>;

type RawProperty = string | boolean | Array<string>;

type RawItem = { "description"?: string; "value": RawProperty };

export type RawItems = Record<string, RawItem>;

export type DeviceSpec = { "family"?: string; "spec": RawItems };

