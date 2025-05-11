export default function StaticPage() {
  return (
    <html>
      <head>
        <title>Static Test Page</title>
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1>Static Test Page</h1>
        <p>This is a completely static page with no client-side functionality.</p>
        <p>If you can see this, then the server is working correctly!</p>
      </body>
    </html>
  );
} 