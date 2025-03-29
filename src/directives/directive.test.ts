import { expect } from "jsr:@std/expect";
import { emptyBag, StringBag, stringBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure, Failure, OldFailure } from "../failure/bags.ts";
import { directiveFunction } from "./directive-function.ts";

const irrelevantName = "testing";

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => {
            directiveParameter = parameter;
            return emptyBag();
        }
    });
    expect(untyped("says hello").type).not.toBe("failures");
    expect(directiveParameter).toBe("says hello");
});

Deno.test("Directives can return a failure", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => bagOfFailures([clueFailure("file_notFound", "" )])
    });

    const result = untyped();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("file_notFound");
});

Deno.test("Directives can return success in the form of an empty box", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => { return emptyBag(); }
    });
    expect(untyped().type).not.toBe("failures");
});

Deno.test("A VoidDirective has no parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => stringBag("hello")
    });

    const successful = untyped()
    expect(successful.type).not.toBe("failures");
    expect((successful as StringBag).it).toBe("hello");

    const failed = untyped("parameter");
    expect(failed.type).toBe("failures");
    const failures = failed.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_count");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["0"]);
});

Deno.test("A string directive can't have zero parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });
    const notEnough = untyped();
    expect(notEnough.type).toBe("failures");
    const failures = notEnough.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_count");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["1"]);
});

Deno.test("A string directive can't have more than 1 parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });

    const tooMany = untyped("1", "2");
    expect(tooMany.type).toBe("failures");
    const failures = tooMany.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_count");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["1"]);
});

Deno.test("A string directive can't have a number parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });

    const wrongNumber = untyped(4);
    expect(wrongNumber.type).toBe("failures");
    const failures = wrongNumber.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string", "0: number"]);
});

Deno.test("A string directive can't have a boolean parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });
    const wrongBoolean = untyped(true);
    expect(wrongBoolean.type).toBe("failures");
    const failures = wrongBoolean.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string", "0: boolean"]);
});

Deno.test("A string directive has a single string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });
    const correct = untyped("this works");
    expect(correct.type).not.toBe("failures");
    expect((correct as StringBag).it).toBe("this works");
});

Deno.test("A number directive can't have a non-numeric string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "numberDirective",
        "it": (parameter: number) => stringBag(`${parameter}`)
    });

    const wrongType = untyped("five");
    expect(wrongType.type).toBe("failures");
    const failures = wrongType.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["number", "0: string"]);
});

Deno.test("A NumberDirective has a single number or numeric string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "numberDirective",
        "it": (parameter: number) => stringBag(`${parameter}`)
    });

    const correctString = untyped("99");
    expect(correctString.type).not.toBe("failures");
    expect((correctString as StringBag).it).toBe("99");

    const correctNumber = untyped(57);
    expect(correctNumber.type).not.toBe("failures");
    expect((correctNumber as StringBag).it).toBe("57");
});

Deno.test("A value directive can't have a number as the first parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            stringBag(`${valueName} = ${actualValue}`)
    });
    // This error reporting could be much, much nicer!
    const wrongNumber = untyped(23, "plop");
    expect(wrongNumber.type).toBe("failures");
    const failures = wrongNumber.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string", "0: number"]);
});

Deno.test("A value directive can't have a string as the second parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            stringBag(`${valueName} = ${actualValue}`)
    });

    // This error reporting could be much, much nicer!
    const wrongString = untyped("plop", "plop");
    expect(wrongString.type).toBe("failures");
    const failures = wrongString.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["number", "1: string"]);
});

Deno.test("A value directive has a string and a numeric parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            stringBag(`${valueName} = ${actualValue}`)
    });
    const correct = untyped("plop", 23);
    expect(correct.type).not.toBe("failures");
    expect((correct as StringBag).it).toBe("plop = 23");
});

Deno.test("A data directive can't have boolean parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => emptyBag()
    });

    const result = untyped(false);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string, number", "0: boolean"]);
});

Deno.test("A data directive can't have object or array parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => emptyBag()
    });
    const result = untyped({}, []);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string, number", "0: object", "1: array"]);
});

Deno.test("A DataDirective has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => emptyBag()
    });
    expect(untyped("hello", 2, 3, "goodbye").type).not.toBe("failures");
});

Deno.test("A function-use directive can't have boolean parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });
    const result = untyped(false);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string, number", "0: boolean"]);
});

Deno.test("A function-use directive can't have object or array parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });
    const result = untyped({}, []);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string, number", "0: object", "1: array"]);
});

Deno.test("A function-use directive has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });
    expect(untyped("hello", 2, 3, "goodbye").type).not.toBe("failures");
});

Deno.test("A function-define directive can't have boolean parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });

    const result = untyped(false);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string", "0: boolean"]);
});

Deno.test("A function-define directive can't have obejct or array parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });
    const result = untyped(1, "two", 3);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect (failure.kind).toBe("parameter_type");
    const oldStyle = failure as OldFailure;
    expect(oldStyle.extra).toEqual(["string", "0: number", "2: number"]);
});

Deno.test("A function-define directive has any number of string parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });
    expect(untyped("hello", "goodbye").type).not.toBe("failures");
});
