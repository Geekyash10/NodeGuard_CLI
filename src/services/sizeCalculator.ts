import fs from "fs";
import path from "path";

export async function calculateFolderSize(folderPath: string): Promise<number> {
  let totalSize = 0;

  async function traverse(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        const stats = await fs.promises.stat(fullPath);
        totalSize += stats.size;
      }
    }
  }

  await traverse(folderPath);
  return totalSize;
}