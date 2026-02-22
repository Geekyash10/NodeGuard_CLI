import { Command } from "commander";
import { scanCommand } from "./commands/scan";
import { cleanByProjectName, cleanByAge } from "./commands/clean";
import { launchDashboard } from "./ui/dashboard";
import { findNodeModules } from "./services/scanner";
import { calculateFolderSize } from "./services/sizeCalculator";
import path from "path";

const program = new Command();

program
  .name("nodeguard")
  .description("Analyze and clean node_modules safely")
  .version("1.0.0");


// ------------------ SCAN ------------------
program
  .command("scan")
  .argument("<path>", "Path to scan")
  .action(async (path: string) => {
    await scanCommand(path);
  });


// ------------------ CLEAN ------------------
program
  .command("clean")
  .argument("[projectName]", "Project name to clean")
  .option("--older-than <days>", "Delete folders older than X days")
  .option("--dry-run", "Simulate deletion")
  .action(async (projectName: string, options) => {
    if (options.olderThan) {
      const days = parseInt(options.olderThan);

      if (isNaN(days)) {
        console.log("❌ Please provide a valid number for days.");
        return;
      }

      await cleanByAge(days, ".", options.dryRun);
    } else if (projectName) {
      await cleanByProjectName(projectName, ".");
    } else {
      console.log("❌ Please provide a project name or use --older-than.");
    }
  });


// ------------------ UI DASHBOARD ------------------
program
  .command("ui")
  .description("Launch interactive dashboard")
  .action(async () => {
    const root = path.resolve(".");
    const modules = await findNodeModules(root);

    const enriched = [];

    for (const m of modules) {
      const size = await calculateFolderSize(m.path);
      enriched.push({
        name: m.projectName,
        size,
        path: m.path,
      });
    }

    launchDashboard(enriched);
  });


program.parse();