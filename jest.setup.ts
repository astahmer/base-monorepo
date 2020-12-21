import diff from "jest-diff";

type PrimitiveValue = string | number | boolean;
type Primitive = PrimitiveValue | Array<PrimitiveValue>;

const isPrimitive = (value: any): value is Primitive =>
    (typeof value !== "object" && typeof value !== "function") || value === null;

/** Compare arrays & return true if all members are included (order doesn't matter) */
function isEqualArrays(arr1: PrimitiveValue[], arr2: PrimitiveValue[]) {
    if (arr1.length !== arr2.length) return false;

    let i;
    for (i = arr1.length; i--; ) {
        if (!arr2.includes(arr1[i])) return false;
    }
    return true;
}


const arrayTester = (received: any, expected: any) =>
    Array.isArray(received) && Array.isArray(expected) && isPrimitive(received[0]) && isPrimitive(expected[0])
        ? isEqualArrays(received, expected)
        : undefined;

expect.extend({
    toEqualMessy(received, expected) {
        const options = {
            comment: "Deep object equality but without considering array keys orders",
            isNot: this.isNot,
            promise: this.promise,
        };

        const pass = this.equals(received, expected, [arrayTester]);
        const message = pass
            ? () =>
                  this.utils.matcherHint("toEqualMessy", undefined, undefined, options) +
                  "\n\n" +
                  `Expected: not ${this.utils.printExpected(expected)}\n` +
                  `Received: ${this.utils.printReceived(received)}`
            : () => {
                  const diffString = diff(expected, received, {
                      expand: this.expand,
                  });
                  return (
                      this.utils.matcherHint("toEqualMessy", undefined, undefined, options) +
                      "\n\n" +
                      (diffString && diffString.includes("- Expect")
                          ? `Difference:\n\n${diffString}`
                          : `Expected: ${this.utils.printExpected(expected)}\n` +
                            `Received: ${this.utils.printReceived(received)}`)
                  );
              };

        return { actual: received, message, pass };
    },
});
