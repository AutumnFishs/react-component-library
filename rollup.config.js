// 集成 全量引入 和 按需引入（不支持 import {xxx} from 'xxx'）格式的打包配置，暂未解决按需引入的问题
import fs from "node:fs";
import path from "node:path";

import resolve from "@rollup/plugin-node-resolve"; // 解析node_modules中的模块
import commonjs from "@rollup/plugin-commonjs"; // 将CommonJS模块转换为ES6，以便浏览器可以理解
import typescript from "@rollup/plugin-typescript"; // 将TypeScript编译为JavaScript
import dts from "rollup-plugin-dts"; // 生成声明文件
import postcss from "rollup-plugin-postcss"; // 处理css
import del from "rollup-plugin-delete"; // 删除文件
import terser from '@rollup/plugin-terser'; // 压缩js

const pkg = JSON.parse(fs.readFileSync("./package.json"));
const componentsDir = "./src/components";

// 读取所有组件文件夹
const componentFiles = fs
  .readdirSync(componentsDir)
  .filter((file) => fs.statSync(path.join(componentsDir, file)).isDirectory());

function createComponentConfig(componentName) {
  return {
    input: `./src/components/${componentName}/${componentName}.tsx`,
    output: [
      {
        file: path.resolve('es', `${componentName}.js`),
        format: "esm",
        sourcemap: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      "./src/stories",
    ],
    plugins: [
      del({
        targets: [
          path.resolve("es", `${componentName}.js`),
        ],
        hook: "buildStart",
        verbose: false,
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        include: [
          `./src/components/${componentName}/index.ts`,
          `./src/components/${componentName}/${componentName}.tsx`,
          `./src/components/${componentName}/${componentName}.scss`,
        ],
      }),
      postcss(),
      terser()
    ],
  };
}
export default [
  // 为每个组件创建配置
  ...componentFiles.map(createComponentConfig),
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    external: [
      './src/stories'
    ],
    plugins: [
      del({
        targets: ['./dist/**'],
        hook: 'buildStart',// 默认就是buildStart，即在build之前执行
        verbose: false// 是否在控制台输出被删除的文件名
      }), // 清空dist文件夹
      resolve(),// 解析node_modules中的模块
      commonjs(),// 将CommonJS模块转换为ES6，以便浏览器可以理解
      typescript({ tsconfig: "./tsconfig.json" }),// 将TypeScript编译为JavaScript
      postcss(),// 处理css
      terser()// 压缩js
    ],
  },
  {
    input: "./dist/esm/index.d.ts",
    output: [{ file: "./dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.(css|less|scss)$/],
  }
];



