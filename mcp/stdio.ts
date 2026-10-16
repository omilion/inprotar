import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { crearServidor } from "./server";
import { crearStore } from "./store";

await crearServidor(crearStore()).connect(new StdioServerTransport());
