import { app } from "./app.js";
import { env } from "./configs/env.js";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API server listening on port ${env.PORT}`);
});
