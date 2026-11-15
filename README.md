# spark

Spark is a conversation-starter app for a phone. Tap who you are about to talk to, how well you know them, and where you are, and it shows a few things you could say, each with a follow-up question. It is built with plain HTML, CSS, and JavaScript, with no build step, no accounts, and no tracking. Nothing you tap leaves your phone.

**Live:** https://glee-builds.github.io/spark/

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser. Press `Ctrl+C` in the terminal to stop the server.

To preview on your phone, connect it to the same Wi-Fi as your Mac and open `http://[your-mac-name].local:8000`.

## Run the tests

```bash
node --test
```
