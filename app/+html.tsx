import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D1117" />
        <meta name="background-color" content="#0D1117" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Alert.io — From alert to action. Community safety platform with real-time incident reporting, monitoring, and family protection." />

        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://tiles.openfreemap.org" />
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #0D1117;
            overflow: hidden;
            font-family: 'Courier New', monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          #root {
            display: flex;
            flex-direction: column;
          }

          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }

          @viewport { width: device-width; }

          @supports (padding: env(safe-area-inset-top)) {
            body {
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
          }

          button, [role="button"] {
            transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.2s ease, background-color 0.25s ease, border-color 0.3s ease, box-shadow 0.35s ease;
          }

          button:active, [role="button"]:active {
            transform: scale(0.97);
          }

          input, textarea {
            transition: border-color 0.3s ease, box-shadow 0.35s ease, background-color 0.25s ease;
          }

          input:focus, textarea:focus {
            border-color: rgba(0, 255, 136, 0.45) !important;
            box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1), 0 0 20px rgba(0, 255, 136, 0.08);
            outline: none;
          }

          input:hover, textarea:hover {
            border-color: rgba(255, 255, 255, 0.15) !important;
          }

          ::-webkit-scrollbar {
            width: 5px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 3px;
            transition: background 0.2s ease;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.18);
          }

          ::selection {
            background: rgba(0, 255, 136, 0.25);
            color: #fff;
          }

          ::placeholder {
            transition: color 0.2s ease;
          }

          @keyframes overlay-slide-in {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideInFromRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(0, 255, 136, 0.2); }
            50% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
          }

          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes floatUpDown {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }

          @media (max-width: 600px) {
            .maplibregl-popup-content {
              max-width: 200px !important;
              font-size: 10px !important;
            }
            .maplibregl-ctrl-group {
              margin: 4px !important;
            }
            .maplibregl-ctrl-group button {
              width: 32px !important;
              height: 32px !important;
            }
            .attn-marker {
              min-width: 24px !important;
              min-height: 24px !important;
            }
            .pub-cam-marker {
              width: 22px !important;
              height: 22px !important;
              font-size: 12px !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.001ms !important;
              transition-duration: 0.001ms !important;
            }
          }

          @media (prefers-contrast: more) {
            :root {
              --high-contrast: 1;
            }
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
