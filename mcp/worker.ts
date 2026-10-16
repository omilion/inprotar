import { atenderMcp, type McpEnv } from "./http";

export default {
  fetch(request: Request, env: McpEnv): Promise<Response> {
    return atenderMcp(request, env);
  },
};
