import path from "path";
import prettyBytes from "pretty-bytes";
import { findNodeModules } from "../services/scanner";
import { calculateFolderSize } from "../services/sizeCalculator";

export async function scanCommand(scanPath: string) {
  const absolutePath = path.resolve(scanPath);

  console.log("🔍 Scanning:", absolutePath);

  const nodeModules = await findNodeModules(absolutePath);

  if (nodeModules.length === 0) {
    console.log("❌ No node_modules folders found.");
    return;
  }

  const enrichedResults = [];

  for (const item of nodeModules) {
    const size = await calculateFolderSize(item.path);

    enrichedResults.push({
      ...item,
      size,
    });
  }

  enrichedResults.sort((a, b) => b.size - a.size);

  let totalUsage = 0;

console.log(`\n📦 Found ${enrichedResults.length} node_modules folders\n`);

enrichedResults.forEach((item, index) => {
  totalUsage += item.size;

  const daysOld = Math.floor(
    (Date.now() - item.lastModified.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log(
    `${index + 1}. ${item.projectName} → ${prettyBytes(item.size)} (Last modified: ${daysOld} days ago)`
  );
});

// Summary calculations
const oldestProject = enrichedResults.reduce((oldest, current) =>
  current.lastModified < oldest.lastModified ? current : oldest
);

console.log("\n💾 Total Usage:", prettyBytes(totalUsage));

console.log("\n📊 Summary:");
console.log("Total Projects:", enrichedResults.length);
console.log(
  "Largest Project:",
  `${enrichedResults[0].projectName} (${prettyBytes(enrichedResults[0].size)})`
);
console.log(
  "Oldest Project:",
  `${oldestProject.projectName}`
);
}