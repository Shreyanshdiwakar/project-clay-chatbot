'use client';

export const TestButton = () => {
  return (
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
  );
}; 