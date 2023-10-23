export type BaseFramework = "next.js";

export type OAuthProvider = "google" | "github" | "discord";

export type NextjsAuthSolution =
  | "next-auth"
  | "clerk"
  | "lucia"
  | "kinde"
  | "auth0"
  | "firebase"
  | "supabase"
  | "appwrite";

export type ZenstackSupportedFramework =
  | "next.js"
  | "nuxt"
  | "sveltekit"
  | "remix"
  | "express";

export type ORM = "prisma" | "drizzle";

export type ParetoJsonSchema = {
  base_framework: BaseFramework;
  auth: {
    solution: NextjsAuthSolution;
    oauth_providers: Array<OAuthProvider>;
  };
  db: {
    orm: ORM;
    zenstack: {
      framework: ZenstackSupportedFramework
    };
  };
};
