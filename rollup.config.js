import path from "path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const PACKAGE_ROOT_PATH = process.cwd();
// const { LERNA_PACKAGE_NAME } = process.env;

export default {
    input: `${PACKAGE_ROOT_PATH}/index.js`,
    output: {
        dir: path.resolve(`${PACKAGE_ROOT_PATH}`, "dist"),
        format: "es",
        sourcemap: true,
    },
    plugins: [
        resolve(), // tells Rollup how to find date-fns in node_modules
        commonjs(), // converts date-fns to ES modules
        css({
            output: "bundle.css",
        }),
        // Copy Shoelace assets to dist/shoelace
        copy({
            targets: [
                {
                    src: path.resolve(
                        __dirname,
                        "node_modules/@shoelace-style/shoelace/dist/assets"
                    ),
                    dest: path.resolve(__dirname, "dist/shoelace"),
                },
            ],
            copyOnce: true,
        }),
        production && terser(), // minify, but only in production
    ],
};
