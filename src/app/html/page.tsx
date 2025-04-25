function HtmlPage() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'blue' }}>Basic HTML Page</h1>
      <p>This is a simple HTML page without any complex styling or React features.</p>
      <p>Text should be visible on a white background.</p>
      <hr />
      <div style={{ marginTop: '20px' }}>
        <p>If you can see this, the rendering is working!</p>
      </div>
    </div>
  );
}

export default HtmlPage; 