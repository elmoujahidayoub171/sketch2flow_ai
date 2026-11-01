import { z } from "zod";

export const nodeConfigSchema = z.record(z.string());

const configSchemas: Record<string, z.ZodTypeAny> = {
  "action.http": z.object({ method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]), url: z.string().url("Enter a valid URL"), headers: z.string(), query: z.string(), body: z.string(), authType: z.enum(["none", "credential-reference"]) }).passthrough(),
  "data.postgres": z.object({ operation: z.enum(["select", "insert", "update", "delete"]), table: z.string().min(1, "Table name is required"), query: z.string(), credential: z.string() }).passthrough(),
  "logic.if": z.object({ conditionType: z.enum(["boolean", "text", "number"]), left: z.string().min(1, "Left operand is required"), operator: z.string().min(1, "Operator is required"), right: z.string() }).passthrough(),
  "trigger.webhook": z.object({ method: z.enum(["GET", "POST", "PUT", "DELETE"]), path: z.string().min(1, "Path is required"), responseMode: z.enum(["immediately", "after-workflow"]) }).passthrough(),
  "trigger.schedule": z.object({ frequency: z.enum(["minutes", "hourly", "daily", "weekly"]), time: z.string(), timezone: z.string().min(1, "Time zone is required") }).passthrough(),
  "action.email": z.object({ recipient: z.string().email("Enter a valid email address"), subject: z.string().min(1, "Subject is required"), message: z.string() }).passthrough(),
};

export type ConfigErrors = Record<string, string>;

export function validateNodeConfig(kind: string, config: Record<string, string>): ConfigErrors {
  const schema = configSchemas[kind] ?? nodeConfigSchema;
  const result = schema.safeParse(config);
  if (result.success) return {};
  return result.error.issues.reduce<ConfigErrors>((errors, issue) => { const field = String(issue.path[0] ?? "config"); if (!errors[field]) errors[field] = issue.message; return errors; }, {});
}

export function defaultNodeConfig(kind: string): Record<string, string> {
  if (kind === "action.http") return { method: "GET", url: "", headers: "", query: "", body: "", authType: "none" };
  if (kind === "data.postgres") return { operation: "select", table: "", query: "", credential: "" };
  if (kind === "logic.if") return { conditionType: "boolean", left: "", operator: "equals", right: "" };
  if (kind === "trigger.webhook") return { method: "POST", path: "/webhook", responseMode: "immediately" };
  if (kind === "trigger.schedule") return { frequency: "daily", time: "09:00", timezone: "UTC" };
  if (kind === "action.email") return { recipient: "", subject: "", message: "" };
  return {};
}
