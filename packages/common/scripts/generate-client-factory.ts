import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Fiber, FileSystem, Layer, Stream } from "effect";
import { FetchHttpClient, HttpClient } from "effect/unstable/http";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const fetchOpenApiSpecs = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient;
  const fs = yield* FileSystem.FileSystem;

  const perpsDocsUrl = process.env.PERPS_DOCS_URL;
  if (!perpsDocsUrl) {
    return yield* Effect.fail(new Error("PERPS_DOCS_URL is not set"));
  }

  yield* client.get(perpsDocsUrl).pipe(
    Effect.andThen((response) => response.text),
    Effect.andThen((txt) => fs.writeFileString(perpsOpenApiJsonPath, txt)),
  );
});

const generateClientFactory = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  const output = yield* runCommand("pnpm", [
    "openapigen",
    "-n",
    "SKClient",
    "-f",
    "httpclient-type-only",
    "-s",
    perpsOpenApiJsonPath,
    "-p",
    openApiPatch,
  ]);

  const outputSchemas = yield* runCommand("pnpm", [
    "openapigen",
    "-n",
    "SKClient",
    "-f",
    "httpclient",
    "-s",
    perpsOpenApiJsonPath,
    "-p",
    openApiPatch,
  ]);

  const clientSchemas = sanitizeGeneratedSource(outputSchemas);

  yield* fs.writeFileString(generateClientPath, output);
  yield* fs.writeFileString(clientSchemasPath, clientSchemas);
  yield* fs.remove(perpsOpenApiJsonPath, { force: true });
});

const program = Effect.gen(function* () {
  yield* fetchOpenApiSpecs;
  yield* generateClientFactory;
});

program.pipe(
  Effect.provide(Layer.mergeAll(FetchHttpClient.layer, NodeServices.layer)),
  NodeRuntime.runMain,
);

const __dirname = dirname(fileURLToPath(import.meta.url));

const perpsOpenApiJsonPath = join(__dirname, "perps.json");

const generateClientPath = join(
  __dirname,
  "..",
  "src",
  "services",
  "api-client",
  "client-factory.ts",
);

const clientSchemasPath = join(
  __dirname,
  "..",
  "src",
  "services",
  "api-client",
  "api-schemas.ts",
);

const openApiPatch = JSON.stringify([
  {
    op: "replace",
    path: "/components/schemas/ArgumentSchemaPropertyDto/properties/items",
    value: {
      type: "object",
      description: "Items schema (for arrays)",
    },
  },
]);

const sanitizeGeneratedSource = (source: string) =>
  source.replaceAll(
    '"examples": [["open","close","updateLeverage"]]',
    '"examples": ["open"]',
  );

const runCommand = (command: string, args: ReadonlyArray<string>) =>
  Effect.scoped(
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const process = yield* spawner.spawn(ChildProcess.make(command, args));
      const stdoutFiber = yield* process.stdout.pipe(
        Stream.decodeText(),
        Stream.mkString,
        Effect.forkChild,
      );
      const stderrFiber = yield* process.stderr.pipe(
        Stream.decodeText(),
        Stream.mkString,
        Effect.forkChild,
      );
      const exitCode = yield* process.exitCode;
      const stdout = yield* Fiber.join(stdoutFiber);
      const stderr = yield* Fiber.join(stderrFiber);

      if (stderr.length > 0) {
        yield* Effect.sync(() => console.error(stderr));
      }

      const exitCodeNumber = Number(exitCode);
      if (exitCodeNumber !== 0) {
        return yield* Effect.fail(
          new Error(stderr || `${command} exited with code ${exitCodeNumber}`),
        );
      }

      return stdout;
    }),
  );
