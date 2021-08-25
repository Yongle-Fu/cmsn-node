module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "browser": true,
        "commonjs": true,
        "mocha": true
    },
    "extends": [
        "eslint:recommended",
    ],
    "parserOptions": {
        "ecmaVersion": 8
    },
    "rules": {
        "quotes": [ 0, "single" ],
        "no-console": [ 0 ],
        "no-loop-func": [ 0 ],
        "new-cap": [ 0 ],
        "no-trailing-spaces": [ 0 ],
        "no-param-reassign": [ 0 ],
        "func-names": [ 0 ],
        "comma-dangle": [ 0 ],
        "no-unused-expressions" : [ 0 ], // until fixed https://github.com/babel/babel-eslint/issues/158
        "block-scoped-var": [ 0 ], // until fixed https://github.com/eslint/eslint/issues/2253
        "no-unused-vars": ["error", { "argsIgnorePattern": "_" }]
    }
};
