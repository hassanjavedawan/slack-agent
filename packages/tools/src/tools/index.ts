import { ToolRegistry } from "../registry.js";
import { bashDefinition, bashExecutor } from "./bash.js";
import { fileEditDefinition, fileEditExecutor } from "./file-edit.js";
import { fileReadDefinition, fileReadExecutor } from "./file-read.js";
import { fileWriteDefinition, fileWriteExecutor } from "./file-write.js";
import { globDefinition, globExecutor } from "./glob.js";
import { grepDefinition, grepExecutor } from "./grep.js";
import { viewImageDefinition, viewImageExecutor } from "./view-image.js";

export function createNativeRegistry(): ToolRegistry {
	const registry = new ToolRegistry();

	registry.register("bash", bashDefinition, bashExecutor);
	registry.register("file_read", fileReadDefinition, fileReadExecutor);
	registry.register("file_write", fileWriteDefinition, fileWriteExecutor);
	registry.register("file_edit", fileEditDefinition, fileEditExecutor);
	registry.register("glob", globDefinition, globExecutor);
	registry.register("grep", grepDefinition, grepExecutor);
	registry.register("view_image", viewImageDefinition, viewImageExecutor);

	return registry;
}
