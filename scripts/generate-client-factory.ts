import { fileURLToPath } from "node:url";
import {
  Command,
  CommandExecutor,
  FetchHttpClient,
  FileSystem,
  HttpClient,
  Path,
} from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Config, Effect, Layer } from "effect";

const fetchOpenApiSpecs = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient;
  const fs = yield* FileSystem.FileSystem;

  const perpsDocsUrl = yield* Config.string("VITE_PERPS_DOCS_URL");
  const perpsJsonPath = yield* perpsOpenApiJsonPath;

  yield* client.get(perpsDocsUrl).pipe(
    Effect.andThen((response) => response.text),
    Effect.andThen((txt) => fs.writeFileString(perpsJsonPath, txt)),
  );
});

const generateClientFactory = Effect.gen(function* () {
  const ce = yield* CommandExecutor.CommandExecutor;
  const fs = yield* FileSystem.FileSystem;

  const output = yield* ce.string(
    Command.make(
      "pnpm",
      "openapi-gen",
      "-n",
      "SKClient",
      "-t",
      "-s",
      yield* perpsOpenApiJsonPath,
    ),
  );

  const outputSchemas = yield* ce.string(
    Command.make(
      "pnpm",
      "openapi-gen",
      "-n",
      "SKClient",
      "-s",
      yield* perpsOpenApiJsonPath,
    ),
  );

  if (yield* fs.exists(yield* generateClientPath)) {
    yield* fs.remove(yield* generateClientPath);
  }
  yield* fs.writeFileString(yield* generateClientPath, output);

  if (yield* fs.exists(yield* clientSchemasPath)) {
    yield* fs.remove(yield* clientSchemasPath);
  }
  yield* fs.writeFileString(yield* clientSchemasPath, outputSchemas);

  yield* fs.remove(yield* perpsOpenApiJsonPath);
});

const formatClientFactory = Effect.gen(function* () {
  const ce = yield* CommandExecutor.CommandExecutor;

  yield* ce.exitCode(
    Command.make("biome", "format", "--write", yield* generateClientPath),
  );
  yield* ce.exitCode(
    Command.make("biome", "format", "--write", yield* clientSchemasPath),
  );
});

const program = Effect.gen(function* () {
  yield* fetchOpenApiSpecs;
  yield* generateClientFactory;
  yield* formatClientFactory;
});

const layer = Layer.mergeAll(FetchHttpClient.layer, NodeContext.layer);

program.pipe(Effect.scoped, Effect.provide(layer), NodeRuntime.runMain);

const __dirname = Path.Path.pipe(
  Effect.andThen((p) => p.dirname(fileURLToPath(import.meta.url))),
);

const perpsOpenApiJsonPath = Effect.all({
  p: Path.Path,
  __dirname,
}).pipe(Effect.andThen(({ p, __dirname }) => p.join(__dirname, "perps.json")));

const generateClientPath = Effect.all({
  p: Path.Path,
  __dirname,
}).pipe(
  Effect.andThen(({ p, __dirname }) =>
    p.join(
      __dirname,
      "..",
      "src",
      "services",
      "api-client",
      "client-factory.ts",
    ),
  ),
);

const clientSchemasPath = Effect.all({
  p: Path.Path,
  __dirname,
}).pipe(
  Effect.andThen(({ p, __dirname }) =>
    p.join(__dirname, "..", "src", "services", "api-client", "api-schemas.ts"),
  ),
);
