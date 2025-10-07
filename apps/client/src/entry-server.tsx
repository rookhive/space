// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';

import './env/server';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="overflow-hidden bg-black text-white">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
