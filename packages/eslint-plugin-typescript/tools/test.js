"use strict";

const path = require("path");
const fs = require("fs");
const diff = require("cli-diff").default;

const { Linter, CLIEngine } = require("eslint");
const { rules } = require("../lib");

const project = path.dirname(__dirname);
const tests = path.join(project, "tests", "rules");

const format = new CLIEngine().getFormatter("codeframe");
const fakeName = "source.ts";

const linter = new Linter();

linter.defineRules(rules);

const testedRules = fs
    .readdirSync(tests)
    .filter(name => !name.endsWith(".snap.ts"))
    .map(name => name.replace(".src.ts", ""));

for (const rule of testedRules) {
    console.log(`testing ${rule}...`);

    const snapPath = path.join(tests, `${rule}.snap.ts`);

    const source = fs.readFileSync(path.join(tests, `${rule}.src.ts`), "utf8");
    const messages = linter.verify(
        source,
        {
            parser: path.join(project, "parser.js"),
            plugins: [require("../lib/index")],
            useEslintrc: false,
            rules: { [rule]: "error" },
        },
        fakeName
    );

    try {
        // eslint-disable-next-line node/no-extraneous-require
        require("chalk").enabled = false;
    } catch (e) {
        /* */
    }

    const received = format([
        {
            filePath: fakeName,
            messages,
            errorCount: messages.length,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source,
        },
    ])
        .replace(
            new RegExp(
                String.raw`^error: (.+?) \(${rule}\) at ${fakeName.replace(
                    ".",
                    "\\."
                )}:(\d+:\d+):$`,
                "gm"
            ),
            "// [$2] $1"
        )
        .replace(/^([ >]) (?:\d+|\s+) \| /gm, "$1")
        .replace(/\n\n\n\d+ errors found\./, "\n");

    try {
        // eslint-disable-next-line node/no-extraneous-require
        require("chalk").enabled = true;
    } catch (e) {
        /* */
    }

    if (fs.existsSync(snapPath)) {
        const expected = fs.readFileSync(snapPath, "utf8");

        const changes = diff(expected, received);

        if (changes) {
            console.error(`${rule}: snapshots differ:`);
            console.log(changes);
            process.exit(1);
        } else {
            console.log(`${rule}: valid \u{2713}`);
        }
    } else {
        if (process.env.CI) {
            console.error(`${rule}: missing snapshot, not creating one in CI`);
            process.exit(1);
        } else {
            fs.writeFileSync(snapPath, received);
            console.log(`${rule}: created new snapshot \u{2713}`);
        }
    }
}
