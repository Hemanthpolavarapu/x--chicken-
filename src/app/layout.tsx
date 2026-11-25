import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "X-Chicken | 100% Fresh, Never Frozen Express Chicken Delivery",
  description:
    "Direct from local store to your kitchen in 15 mins. Strictly 100% fresh, cut-to-order poultry with zero frozen storage, zero preservatives, and farm-fresh taste.",
  keywords: [
    "X-Chicken",
    "Express chicken delivery",
    "fresh chicken online",
    "no frozen chicken",
    "cut to order chicken",
    "chicken home delivery",
    "biryani cut chicken",
    "chicken curry cut",
    "boneless chicken breast",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function clean() {
                  var els = document.querySelectorAll('[fdprocessedid]');
                  for (var i = 0; i < els.length; i++) {
                    els[i].removeAttribute('fdprocessedid');
                  }
                }
                clean();
                try {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'fdprocessedid') {
                        m.target.removeAttribute('fdprocessedid');
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['fdprocessedid']
                  });
                } catch(e) {}
                window.addEventListener('DOMContentLoaded', clean);
                window.addEventListener('load', clean);
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-[#F8F9FB] text-[#1C1E21] antialiased selection:bg-[#D11243] selection:text-white"
        suppressHydrationWarning
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
