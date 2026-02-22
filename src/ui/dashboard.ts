import blessed from "blessed";
import prettyBytes from "pretty-bytes";
import fs from "fs-extra";

interface Project {
  name: string;
  size: number;
  path: string;
}

export function launchDashboard(initialProjects: Project[]) {
  const screen = blessed.screen({
    smartCSR: true,
    title: "NodeGuard",
  });

  let projects = [...initialProjects];
  projects.sort((a, b) => b.size - a.size);

  let filteredProjects = [...projects];
  let selected = new Set<number>();
  let totalSelectedSize = 0;

  // ================= LOADING =================
  const loadingBox = blessed.box({
    top: "center",
    left: "center",
    width: "40%",
    height: 5,
    border: { type: "line" },
    content: "\n  Scanning projects...",
  });

  screen.append(loadingBox);
  screen.render();

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    loadingBox.setContent(
      `\n  Scanning projects${".".repeat(dots)}`
    );
    screen.render();
  }, 300);

  setTimeout(() => {
    clearInterval(interval);
    screen.remove(loadingBox);
    initializeUI();
  }, 800);

  function calculateTotalDisk() {
    return projects.reduce((sum, p) => sum + p.size, 0);
  }

  function initializeUI() {
    const header = blessed.box({
      top: 0,
      width: "100%",
      height: 3,
      content: `  NodeGuard Dashboard   |   Total Disk: ${prettyBytes(
        calculateTotalDisk()
      )}`,
      border: { type: "line" },
      style: {
        fg: "cyan",
        border: { fg: "cyan" },
      },
    });

    const infoBar = blessed.box({
      top: 3,
      width: "100%",
      height: 3,
      content: `  Releasable space: 0 MB`,
      border: { type: "line" },
      style: {
        fg: "yellow",
        border: { fg: "yellow" },
      },
    });

    const listBox = blessed.box({
      top: 6,
      width: "100%",
      height: "75%",
      border: { type: "line" },
      style: {
        border: { fg: "white" },
      },
    });

    const list = blessed.list({
      parent: listBox,
      top: 1,
      left: 1,
      width: "98%",
      height: "95%",
      keys: true,
      mouse: true,
      tags: true,
      style: {
        selected: {
          bg: "blue",
          fg: "white",
        },
      },
    });

    const footer = blessed.box({
      bottom: 0,
      width: "100%",
      height: 3,
      content:
        "  ↑↓ Navigate   SPACE Select   ENTER Delete   / Search   Q Exit",
      border: { type: "line" },
      style: {
        fg: "green",
        border: { fg: "green" },
      },
    });

    function renderItems() {
      return filteredProjects.map((p, index) => {
        const isSelected = selected.has(index);
        const prefix = isSelected ? "[✔] " : "[ ] ";

        const sizeText = prettyBytes(p.size);

        let colorTag = "{green-fg}";
        if (p.size > 1000 * 1024 * 1024) {
          colorTag = "{red-fg}";
        } else if (p.size > 500 * 1024 * 1024) {
          colorTag = "{yellow-fg}";
        }

        return `${prefix}${p.name}   ${colorTag}${sizeText}{/}`;
      });
    }

    list.setItems(renderItems());

    // SPACE
    list.key("space", () => {
      const index = (list as any).selected;

      if (selected.has(index)) {
        selected.delete(index);
      } else {
        selected.add(index);
      }

      totalSelectedSize = 0;
      selected.forEach((i) => {
        if (filteredProjects[i]) {
          totalSelectedSize += filteredProjects[i].size;
        }
      });

      list.setItems(renderItems());
      infoBar.setContent(
        `  Releasable space: ${prettyBytes(totalSelectedSize)}`
      );
      screen.render();
    });

    // SEARCH
    screen.key("/", () => {
      const prompt = blessed.prompt({
        top: "center",
        left: "center",
        width: "50%",
        height: 7,
        border: { type: "line" },
        label: " Search ",
      });

      screen.append(prompt);

      prompt.input("Search project:", "", (err, value) => {
        if (value) {
          filteredProjects = projects.filter((p) =>
            p.name.toLowerCase().includes(value.toLowerCase())
          );
        } else {
          filteredProjects = [...projects];
        }

        selected.clear();
        totalSelectedSize = 0;

        list.setItems(renderItems());
        infoBar.setContent("  Releasable space: 0 MB");

        screen.remove(prompt);
        screen.render();
      });
    });

    // DELETE
    list.key("enter", () => {
      if (selected.size === 0) return;

      const confirmBox = blessed.box({
        top: "center",
        left: "center",
        width: "50%",
        height: 7,
        border: { type: "line" },
        style: { border: { fg: "red" } },
        content: `\n  Delete ${selected.size} selected folders?\n\n  (y) Yes    (n) No`,
      });

      screen.append(confirmBox);
      screen.render();

      const handler = async (ch: string) => {
        if (ch === "y") {
          for (const index of selected) {
            if (filteredProjects[index]) {
              await fs.remove(filteredProjects[index].path);
            }
          }

          projects = projects.filter(
            (p) =>
              !filteredProjects.some(
                (fp, i) => selected.has(i) && fp.path === p.path
              )
          );

          filteredProjects = [...projects];
        }

        selected.clear();
        totalSelectedSize = 0;

        list.setItems(renderItems());
        infoBar.setContent("  Releasable space: 0 MB");

        screen.remove(confirmBox);
        screen.render();
        screen.unkey("y", handler);
        screen.unkey("n", handler);
      };

      screen.key("y", handler);
      screen.key("n", handler);
    });

    screen.key(["q", "C-c"], () => process.exit(0));

    screen.append(header);
    screen.append(infoBar);
    screen.append(listBox);
    screen.append(footer);

    list.focus();
    screen.render();
  }
}