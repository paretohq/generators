import { NextAuthGenerator } from "@paretohq/next-auth-generator";
import { ParetoJsonSchema } from "@paretohq/types";

interface Generator {
  execute: () => Promise<Boolean>;
}

export class GeneratorContext {
  schema: ParetoJsonSchema;
  generators: Array<Generator> = [];

  constructor(schema: ParetoJsonSchema) {
    this.schema = schema;
  }

  async prepare() {
    if (this.schema.auth.solution == "next-auth") {
      this.generators.push(new NextAuthGenerator(this.schema));
    }
  }

  execute() {
    for (let generator of this.generators) {
      generator.execute();
    }
  }
}
