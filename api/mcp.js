import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "Products API",
  version: "1.0.0",
});

server.tool("getProducts", "Returns all Products", {}, async () => {
  const response = await axios.get(
    "https://angular-json.vercel.app/Products"
  );

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data),
      },
    ],
  };
});

const sessions = {};

/**
 * SSE endpoint
 */
export default async function handler(req, res) {
  const transport = new SSEServerTransport("/mcp", res);

  const sessionId = transport.sessionId;
  sessions[sessionId] = transport;

  await server.connect(transport);

  res.on("close", () => {
    delete sessions[sessionId];
  });

  if (req.method === "POST") {
    const sessionId = req.query.sessionId;
    const session = sessions[sessionId];

    if (!session) {
      return res.status(400).send("Invalid session");
    }

    return session.handlePostMessage(req, res);
  }
}