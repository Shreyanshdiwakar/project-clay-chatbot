export default function MinimalTestPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Minimal Test Page</h1>
      <p>This is a minimal test page without any complex dependencies.</p>
      <button 
        style={{ 
          padding: "10px 15px", 
          backgroundColor: "#0070f3", 
          color: "white", 
          border: "none", 
          borderRadius: "5px", 
          cursor: "pointer" 
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
} 