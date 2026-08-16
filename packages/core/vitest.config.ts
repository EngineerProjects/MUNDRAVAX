import { defineProject, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineProject({
	test: {
		setupFiles: "./test/setup.ts",
		include: ["test/features/**/*.test.ts"],
		exclude: ["test/features/_utils/react.utils.test.tsx"],
	},
}));