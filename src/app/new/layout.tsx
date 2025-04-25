export default function NewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
        {children}
      </body>
    </html>
  );
} 