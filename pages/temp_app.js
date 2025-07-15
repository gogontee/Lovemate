// pages/_app.js
import "../styles/globals.css";
// Inside your _app.js or _app.tsx
import "react-phone-number-input/style.css";

export default function app({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
