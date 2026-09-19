Little Prince Name Reveal - 200 Participants

Features:
- 200 participant positions per round.
- 200-name pool; each pool name is used once per round when no custom name is introduced.
- Admin can choose a special name and any position 1-200.
- Name matching is case-insensitive. For example, entering "AARUSH", "Aarush", or "aarush" matches the pool name "Aarush" and moves that canonical pool name to the selected position.
- If the chosen name is in the pool, it is removed from its random position and placed at the admin-selected position, so it cannot appear elsewhere.
- If the chosen name is not in the pool, it is used at the selected position and 199 of the 200 pool names fill the other positions.
- Saving the admin name + position starts a completely new round immediately, exactly like Reset Game: participant counter returns to #1 and all prior participant assignments are cleared.
- Reset Game also starts a completely new round while retaining the current special name and position.
- Admin is password protected with password: lilprince. Server-side endpoints also require the password.


Deployment reset behavior
--------------------------
Every Netlify deployment generates a unique deployment ID from Netlify's DEPLOY_ID build variable.
The server compares that ID with the stored game state. When a new deployment is detected, the old
configuration and all 200 participant assignments are cleared. The public page therefore stays on
"Game starts soon" until Admin enters a new chosen name and position.
