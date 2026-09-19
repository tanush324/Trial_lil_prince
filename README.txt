LITTLE PRINCE NAME REVEAL — SERVER TRIAL

NEW BEHAVIOR
- There are 10 participant slots per round.
- Slot 6 ALWAYS receives Shrinivasprasad.
- Slots 1-5 and 7-10 receive the other 9 names in a randomized order.
- Names are never shown in the reveal animation.
- The assignment is server-side, so different phones receive different participant slots.
- The same browser/device keeps its assigned name using a secure cookie.
- Admin Reset starts a completely new round and randomizes the nine non-fixed names again.
- No Replace Name List option is included.

ADMIN
- Trial password: trial123
- For a stronger password, set Netlify environment variable TRIAL_ADMIN_PASSWORD.

IMPORTANT DEPLOYMENT NOTE
This version uses a Netlify Function and Netlify Blobs. It must be deployed as a Netlify project with functions enabled; the functions directory is netlify/functions.
