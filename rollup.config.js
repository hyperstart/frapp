const minimist = require("minimist")

const commonjs = require("rollup-plugin-commonjs")
const nodeResolve = require("rollup-plugin-node-resolve")
const typescript = require("rollup-plugin-typescript2")
const uglify = require("rollup-plugin-uglify")

const options = minimist(process.argv.slice(2), {
  boolean: ["min", "es"]
})

const plugins = [
  nodeResolve({
    extensions: [".ts", ".js", ".json"],
    jsnext: true
  }),
  commonjs(),
  typescript({
    clean: true,
    exclude: ["*.d.ts", "**/*.d.ts", "*.test.*", "**/*.test.*"]
  })
]
if (options.min) {
  plugins.push(uglify())
}

export default {
  input: "src/index.ts",
  output: {
    file: options.min
      ? "dist/frapp.min.js"
      : options.es ? "dist/frapp.es.js" : "dist/frapp.js",
    format: options.es ? "es" : "umd",
    name: "frapp",
    sourcemap: true
  },
  plugins
}
