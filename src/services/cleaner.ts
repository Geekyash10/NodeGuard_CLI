import fs from "fs-extra";

export async function deleteFolder(folderPath: string): Promise<void> {
  await fs.remove(folderPath);
}