import { createServer } from "vite";

const port = Number(process.env.FRONTEND_PORT || 5173);
const server = await createServer({
  server: {
    host: "0.0.0.0",
    port,
  },
});

await server.listen();
server.printUrls();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await server.close();
    process.exit(0);
  });
}
