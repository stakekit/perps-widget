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

  const stakingDocsUrl = yield* Config.url("VITE_STAKING_BASE_URL").pipe(
    Config.map((v) => {
      v.pathname = "/staking-docs-json";
      return v.toString();
    }),
  );
  const perpsDocsUrl = yield* Config.string("VITE_PERPS_DOCS_URL");

  yield* Effect.all(
    [
      {
        url: stakingDocsUrl,
        path: yield* stakingOpenApiJsonPath,
      },
      {
        url: perpsDocsUrl,
        path: yield* perpsOpenApiJsonPath,
      },
    ].map((v) =>
      client.get(v.url).pipe(
        Effect.andThen((response) => response.text),
        Effect.andThen((txt) => fs.writeFileString(v.path, txt)),
      ),
    ),
    { concurrency: "unbounded" },
  );
});

const filterSpecs = Effect.gen(function* () {
  const ce = yield* CommandExecutor.CommandExecutor;
  const fs = yield* FileSystem.FileSystem;

  yield* ce.exitCode(
    Command.make(
      "pnpm",
      "openapi-filter",
      "-f",
      "operationId",
      "-v",
      "TokenController_getTokenBalances",
      "-v",
      "TokenController_getTokenPrices",
      "-i",
      "--valid",
      "--",
      yield* stakingOpenApiJsonPath,
      yield* stakingOpenApiJsonPath,
    ),
  );

  const stakingOpenApiJson = yield* fs.readFileString(
    yield* stakingOpenApiJsonPath,
  );
  const perpsOpenApiJson = yield* fs.readFileString(
    yield* perpsOpenApiJsonPath,
  );

  const stakingOpenApiJsonParsed = JSON.parse(stakingOpenApiJson);
  const perpsOpenApiJsonParsed = JSON.parse(perpsOpenApiJson);

  const {
    paths: stakingPaths,
    components: {
      schemas: { Networks: _, ...stakingSchemas },
    },
  } = stakingOpenApiJsonParsed;

  const {
    paths: perpsPaths,
    components: { schemas: perpsSchemas },
  } = perpsOpenApiJsonParsed;

  yield* fs.writeFileString(
    yield* perpsOpenApiJsonPath,
    JSON.stringify({
      ...perpsOpenApiJsonParsed,
      paths: {
        ...perpsPaths,
        ...stakingPaths,
      },
      components: {
        ...perpsOpenApiJsonParsed.components,
        schemas: {
          ...perpsSchemas,
          ...stakingSchemas,
        },
      },
    }),
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

  yield* fs.remove(yield* stakingOpenApiJsonPath);
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
  yield* filterSpecs;
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

const stakingOpenApiJsonPath = Effect.all({
  p: Path.Path,
  __dirname,
}).pipe(
  Effect.andThen(({ p, __dirname }) => p.join(__dirname, "staking.json")),
);

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
