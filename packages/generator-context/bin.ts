#!/usr/bin/env node

import { readFileSync } from "fs";
import { GeneratorContext } from ".";
import { paths } from "./globals";

const schema_json = readFileSync(paths.schema_path, "utf-8");
const schema = JSON.parse(schema_json);

const generator = new GeneratorContext(schema);

await generator.prepare();
generator.execute();
