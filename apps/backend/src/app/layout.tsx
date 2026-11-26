export const metadata = {
  title: "X-Chicken Backend API",
};

export default function BackendRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
