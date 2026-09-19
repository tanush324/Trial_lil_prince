LITTLE PRINCE NAME REVEAL — SERVER TRIAL (FIXED)

This version fixes the previous "Please try again" problem.

Important deployment structure:
index.html
package.json
netlify.toml
netlify/functions/reveal.js
netlify/functions/reset.js

Game logic:
- 10 participants per round.
- Participants 1–5 and 7–10 receive unique randomly shuffled names from the 9 ordinary names.
- Participant 6 always receives Shrinivasprasad.
- No names are shown during the reveal animation.
- The participant's browser receives a persistent anonymous cookie, so returning to the same browser gets the same assignment during that round.
- Admin reset starts a new round.

IMPORTANT:
Deploy from the GitHub repository containing the files above. Do not upload index.html alone.
The frontend calls the Netlify Functions directly at:
  /.netlify/functions/reveal
  /.netlify/functions/reset

Admin password: trial123
