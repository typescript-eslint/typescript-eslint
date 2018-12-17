"use strict";

const path = require("path");
const fs = require("fs");
const requireIndex = require("requireindex");

/**
 * Generate recommended configuration
 * @returns {void}
 */
function generate() {
    // replace this with Object.entries when node > 8
    const allRules = requireIndex(path.resolve(__dirname, "../lib/rules"));
    const rules = Object.keys(allRules)
        .filter(key => allRules[key].meta.docs.recommended)
        .reduce((config, item) => {
            config[item] = "error";
            return config;
        }, {});

    const filePath = path.resolve(__dirname, "../lib/configs/recommended.json");

    fs.writeFileSync(filePath, `${JSON.stringify({ rules }, null, 4)}\n`);
}

generate();
