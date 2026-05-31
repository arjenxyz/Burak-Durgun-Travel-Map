import { runSync } from "../src/lib/sync/run-sync";

runSync({ mode: "full" })
  .then((result) => {
    console.log("Sync complete:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Sync failed:", error);
    process.exit(1);
  });
