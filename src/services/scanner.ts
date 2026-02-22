import fs from "fs";
import path from "path";

export interface NodeModuleInfo {
  path: string;
  projectName: string;
  lastModified: Date;
}

export async function findNodeModules(
  rootPath: string
): Promise<NodeModuleInfo[]> {
  const results: NodeModuleInfo[] = [];

  async function traverse(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (!entry.isDirectory()) continue;

      if (entry.name === "node_modules") {
        const stats = await fs.promises.stat(fullPath);

        results.push({
          path: fullPath,
          projectName: path.basename(path.dirname(fullPath)),
          lastModified: stats.mtime,
        });

        continue; // don't go inside node_modules
      }

      await traverse(fullPath);
    }
  }

  await traverse(rootPath);
  return results;
}