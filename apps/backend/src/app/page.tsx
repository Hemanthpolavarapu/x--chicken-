export default function BackendHomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>X-Chicken Backend API</h1>
      <p>Health check: <code>GET /api/health</code></p>
      <p>API Version: <code>/api/v1</code></p>
    </main>
  );
}
