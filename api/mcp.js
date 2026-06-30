import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "Products API",
  version: "1.0.0",
});

// Register tool once at module load
server.tool("getProducts", "Returns all Products", {}, async () => {
  try {
    const response = await axios.get("https://angular-json.vercel.app/Products");
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error fetching products: ${err.message}` }] };
  }
});

const sessions = {};

export default async function handler(req, res) {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Use static route path instead of req.url
  const transport = new SSEServerTransport("/api/mcp", res);
  const sessionId = transport.sessionId;
  sessions[sessionId] = transport;

  await server.connect(transport);

  res.on("close", () => {
    delete sessions[sessionId];
  });

  if (req.method === "POST") {
    const session = sessions[req.query.sessionId];
    if (!session) return res.status(400).send("Invalid session");
    return session.handlePostMessage(req, res);
  }
}
