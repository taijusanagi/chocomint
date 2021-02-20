const { writeFile } = require("fs").promises;
const Ceramic = require("@ceramicnetwork/http-client").default;
const { createDefinition, publishSchema } = require("@ceramicstudio/idx-tools");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const fromString = require("uint8arrays/from-string");

const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com";

const CreatedChocomintSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "CreatedChocomint",
  type: "object",
  properties: {
    chocomints: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
  },
};

const LikedChocomintSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "LikedChocomint",
  type: "object",
  properties: {
    chocomints: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
  },
};

const FollowedChocominterSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "FollowedChocominter",
  type: "object",
  properties: {
    chocomints: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
  },
};

async function run() {
  const seed = fromString(process.env.SEED, "base16");
  const ceramic = new Ceramic(CERAMIC_URL);
  await ceramic.setDIDProvider(new Ed25519Provider(seed));
  const [
    createdChocomintSchema,
    likedChocomintSchema,
    followedChocominterSchema,
  ] = await Promise.all([
    publishSchema(ceramic, { content: CreatedChocomintSchema }),
    publishSchema(ceramic, { content: LikedChocomintSchema }),
    publishSchema(ceramic, { content: FollowedChocominterSchema }),
  ]);

  const CreatedChocomintDefinition = await createDefinition(ceramic, {
    name: "createdChocomint",
    description: "Created Chocomint",
    schema: createdChocomintSchema.commitId.toUrl(),
  });

  const LikedChocomintDefinition = await createDefinition(ceramic, {
    name: "likedChocomint",
    description: "Liked Chocomint",
    schema: likedChocomintSchema.commitId.toUrl(),
  });

  const FollowedChocominterDefinition = await createDefinition(ceramic, {
    name: "followedChocominter",
    description: "Followed Chocominter",
    schema: createdChocomintSchema.commitId.toUrl(),
  });

  const config = {
    definitions: {
      createdChocomint: CreatedChocomintDefinition.id.toString(),
      likedChocomint: LikedChocomintDefinition.id.toString(),
      followedChocomint: FollowedChocominterDefinition.id.toString(),
    },
    schemas: {
      createdChocomint: createdChocomintSchema.commitId.toUrl(),
      likedChocomint: likedChocomintSchema.commitId.toUrl(),
      followedChocomint: followedChocominterSchema.commitId.toUrl(),
    },
  };
  await writeFile("./src/config.json", JSON.stringify(config));

  console.log("Config written to src/config.json file:", config);
  process.exit(0);
}

run().catch(console.error);
