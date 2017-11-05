const commonjs = require("rollup-plugin-commonjs")
const nodeResolve = require("rollup-plugin-node-resolve")
const typescript = require("rollup-plugin-typescript2")
const uglify = require("rollup-plugin-uglify")

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "umd",
    name: "frapp"
  },
  plugins: [
    nodeResolve({
      extensions: [".ts", ".js", ".json"],
      jsnext: true
    }),
    commonjs(),
    typescript({
      clean: true,
      exclude: ["*.d.ts", "**/*.d.ts", "*.test.*", "**/*.test.*"]
    }),
    uglify()
  ]
}
