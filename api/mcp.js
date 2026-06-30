import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const server = new McpServer({
  name: "Products API",
  version: "1.0.0",
});

server.tool("getProducts", "Returns all Products", {}, async () => {
  const response = await axios.get("https://angular-json.vercel.app/Products");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data),
      },
    ],
  };
});

export default async function handler(req, res) {
  const transport = new StreamableHTTPServerTransport({
    path: "/mcp",
  });

  await server.connect(transport);

  return transport.handleRequest(req, res);
}