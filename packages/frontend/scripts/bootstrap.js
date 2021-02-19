const { writeFile } = require("fs").promises;
const Ceramic = require("@ceramicnetwork/http-client").default;
const { createDefinition, publishSchema } = require("@ceramicstudio/idx-tools");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const fromString = require("uint8arrays/from-string");

const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com";

const ChocomintCreatedSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ChocomintCreated",
  type: "array",
  items: { type: "string" },
  uniqueItems: true,
  default: [],
};

async function run() {
  const seed = fromString(process.env.SEED, "base16");
  const ceramic = new Ceramic(CERAMIC_URL);
  await ceramic.setDIDProvider(new Ed25519Provider(seed));
  const [chocomintCreatedSchema] = await Promise.all([
    publishSchema(ceramic, { content: ChocomintCreatedSchema }),
  ]);

  const ChocomintCreatedDefinition = await createDefinition(ceramic, {
    name: "chocomint",
    description: "Chocomint ",
    schema: chocomintCreatedSchema.commitId.toUrl(),
  });

  // Write config to JSON file
  const config = {
    definitions: {
      created: ChocomintCreatedDefinition.id.toString(),
    },
    schemas: {
      created: chocomintCreatedSchema.commitId.toUrl(),
    },
  };
  await writeFile("./src/config.json", JSON.stringify(config));

  console.log("Config written to src/config.json file:", config);
  process.exit(0);
}

run().catch(console.error);
