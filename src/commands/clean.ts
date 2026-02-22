import path from "path";
import prettyBytes from "pretty-bytes";
import inquirer from "inquirer";
import { findNodeModules } from "../services/scanner";
import { calculateFolderSize } from "../services/sizeCalculator";
import { deleteFolder } from "../services/cleaner";

export async function cleanByProjectName(
  projectName: string,
  rootPath: string
) {
  const absolutePath = path.resolve(rootPath);

  const nodeModules = await findNodeModules(absolutePath);

  const target = nodeModules.find(
    (item) => item.projectName === projectName
  );

  if (!target) {
    console.log(`❌ Project "${projectName}" not found.`);
    return;
  }

  const size = await calculateFolderSize(target.path);

  console.log(`\n⚠️ This will delete: ${projectName}`);
  console.log(`Size to be freed: ${prettyBytes(size)}\n`);

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Proceed?",
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log("❌ Operation cancelled.");
    return;
  }

  await deleteFolder(target.path);

  console.log(`\n✅ Deleted ${projectName}/node_modules`);
  console.log(`💾 Freed: ${prettyBytes(size)}\n`);
}

export async function cleanByAge(
  days: number,
  rootPath: string,
  dryRun: boolean
) {
  const absolutePath = path.resolve(rootPath);
  const nodeModules = await findNodeModules(absolutePath);

  if (nodeModules.length === 0) {
    console.log("❌ No node_modules folders found.");
    return;
  }

  const now = Date.now();
  const threshold = days * 24 * 60 * 60 * 1000;

  const oldProjects = nodeModules.filter((item) => {
    const age = now - item.lastModified.getTime();
    return age > threshold;
  });

  if (oldProjects.length === 0) {
    console.log(`✅ No folders older than ${days} days.`);
    return;
  }

  let totalSize = 0;

  console.log(`\n📦 Folders older than ${days} days:\n`);

  for (const item of oldProjects) {
    const size = await calculateFolderSize(item.path);
    totalSize += size;

    console.log(
      `• ${item.projectName} → ${prettyBytes(size)}`
    );
  }

  console.log(`\n⚠️ This will delete ${oldProjects.length} folders`);
  console.log(`💾 Total space to be freed: ${prettyBytes(totalSize)}\n`);

  if (dryRun) {
    console.log("🧪 Dry run mode enabled. No folders deleted.\n");
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Proceed?",
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log("❌ Operation cancelled.");
    return;
  }

  for (const item of oldProjects) {
    await deleteFolder(item.path);
    console.log(`✅ Deleted ${item.projectName}/node_modules`);
  }

  console.log(`\n🎉 Cleanup completed.`);
}