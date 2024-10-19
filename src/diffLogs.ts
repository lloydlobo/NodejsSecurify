// See https://www.npmjs.com/package/diff#examples

import colors from "colors";

import { Change, diffLines } from "diff";

const IS_PREFIX_ENABLE = true;

// this one especially does not add prefix for each line:
//
//
// OUTPUT:
//
//   This is the first log.
// It has multiple lines.
//
// - Some lines are similar.
// 1 + 1 == 2;
//
// + Some lines are different.
// 1 + 1 != 3;
// type ChangeKind = "added" | "removed" | "none";
export function diffLogs(a: string, b: string): Map<number, [string, string]> {
    const changedObjects: Change[] = diffLines(a, b);

    const stats = new Map<number, [string, string]>();

    changedObjects.forEach((part: Change) => {
        let prefix = part.added ? "+" : part.removed ? "-" : " ";
        prefix += " "; // add inline-start padding
        if (!IS_PREFIX_ENABLE) {
            prefix = ""; // TEMPORARY: manually disable for now
        }

        // Highlighted changed line parts.
        const lines = part.value.split("\n");
        blk: for (let i = 0, n = lines.length; i < n; i++) {
            const line = lines[i];
            const lineno = i + 1; //> Ln 1, Col 1
            const isLastEmptyLine = line === "" && i === n - 1;
            if (isLastEmptyLine) continue blk;
            const changeKind = part.added ? "added" : part.removed ? "removed" : "none";
            // if (changeKind === "none" && !(!part.added && !part.removed)) throw new Error("oops");
            stats.set(lineno, [changeKind as string, line]);
            const removedChange: string = part.removed ? colors.bgRed(prefix + line) : prefix + line;
            const addedChange: string = colors.bgGreen(prefix + line);
            const data = part.added ? addedChange : removedChange;
            const isFlushOrQueued = process.stderr.write(`${data}\n`, "utf-8");
            if (!isFlushOrQueued) console.warn("Failed to write to stderr.");
        }
    });

    return stats;
}

// const isSkipTest = false;
// if (!isSkipTest) {
//     testDiffLogs();
// }
export function testDiffLogs() {
    const log1 = `
******************************************************************************************
****************************** Node-Js-Securify STARTED ***************************
******************************************************************************************

Searching for .js files in (root directory) : /home/lloyd/p/lang_ts/NodejsSecurify/dist

File names in .gitignore files not getting parsed:

, Vulnerability, dist, NodeJsSecurify.js, node_modules

File path name of .js & .jsx files getting parsed:

/home/lloyd/p/lang_ts/NodejsSecurify/dist/GenerateReport.js
==> No callback hell detected. Code looks good!


==> Code NOT vulnerable to Brute force Attack


==> NO RegExp object detected with ReDoS-prone patterns


==> Code has proper input validation


==> No dangerous function detected


==> NO Insecure Authentication detected


==> No Insecure Security Headers found
`;

    const log2 = `
******************************************************************************************
****************************** Node-Js-Securify STARTED ***************************
******************************************************************************************

Searching for .js files in (root directory) : /home/lloyd/p/lang_ts/NodejsSecurify/dist

File names in .gitignore files not getting parsed:

, Vulnerability, dist, NodeJsSecurify.js, node_modules

File path name of .js & .jsx files getting parsed:

/home/lloyd/p/lang_ts/NodejsSecurify/dist/GenerateReport.js
==> No callback hell detected. Code looks good!


==> Code NOT vulnerable to Brute force Attack


==> Following dangerous function detected:
> RegExp detected at line: 1 Ensure: Regular expression to match only letters
=====> Ignore above errors if you already made changes to your code <=====


==> Code has proper input validation


==> No dangerous function detected


==> NO Insecure Authentication detected


==> NO Insecure Security Headers found
`;

    const actual: Map<number, readonly [string, string]> = diffLogs(log1, log2);
    // WARN: This seems buggy.
    {
        let changeCount = 0;
        actual.forEach((entry) => (changeCount += entry[0] === "none" ? 0 : 1));

        const __isLogMe = false; // FIXME: should assert if change in constant strings `log1` vs `log2`
        if (__isLogMe && changeCount > 0) console.warn(JSON.stringify(actual));
    }
}
