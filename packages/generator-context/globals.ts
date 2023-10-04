import { join } from "path";

const app_path = process.cwd();
const pareto_path = join(app_path, ".pareto");
const schema_path = join(pareto_path, "schema.json");

export const paths = {
  app_path,
  pareto_path,
  schema_path,
};
