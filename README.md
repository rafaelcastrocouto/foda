# [Fight Over Dat Ancient][1]

[![Discord Chat Channel](https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/discord.png)][2]
  [![FODA icon](https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/campaign/ico_rosh.png)][1]  [![FODA rating](https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/ratingsymbol_e10.png)][9]

## Source Code [![Run on Repl.it](https://repl.it/badge/github/rafaelcastrocouto/foda)](https://repl.it/github/rafaelcastrocouto/foda)

A **card game** with magical heroes, each with unique skills and powerful abilities.

Play for free [online in your browser][1] or check us out on the [Google play app store][11]

Join our community and discuss the game rules at our [Discord Server][2]. 

### Downloads:

 - Windows [FODA-win32-ia32.zip](https://www.dropbox.com/s/kabww6pleqm7a1j/FODA-win32-ia32.zip?dl=0)
 - Mac-OS [FODA-darwin-x64.zip](https://www.dropbox.com/s/b8k8yic4pykhtvy/FODA-darwin-x64.zip?dl=0)
 - Linux [FODA-linux-ia32.zip](https://www.dropbox.com/s/nzn21x1x20kbv2m/FODA-linux-ia32.zip?dl=0)

Feel free to [fork][3] or [download][4] and help build the game!
You can even [make a new hero][6]

Visit our Wiki page where you can learn [how to play with real cards][7] and much more.

All [artwork][5] can be downloaded for free in high resolution. 

Please report any [suggestions, bugs or issues][8] here at github.

[![Fight Over Dat Ancient](https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/banner.jpg)][1]

## Hacking at Home (or *Local server setup*)

1. [Download](http://nodejs.org/download/) and install Node.js

1. [Fork](https://github.com/rafaelcastrocouto/dotacard/fork) and [clone](https://git-scm.com/docs/git-clone) this repo

1. Install the dependencies: `npm install` (if all you will edit is the front-end, you can skip steps 4, 5 and 6 and just set `MONGO_CONN=""` inside `.env`)

1. Create a free Mongo DB at [mlab.com](https://mlab.com/) *(or at any other mongo server)*

1. Create an user to access your DB *(you can do this, and all DB related setup, in the mlab.com web interface)*

1. Create a collection named `collection` in your mongo db and inside it, create a document with this content: `{"document": "dotacard"}`

1. Set up you environment config copping `EXAMPLE.env` to `.env`, then edit `.env` with your DB connection URL (in Windows you need to create `.env.` - note the last dot will be auto removed)

1. Build client side bundle: `npm run build` (or `grunt`)

1. Run the server: `npm start` (or `node server.js`)

1. Happy Hacking!

After you change any UI code, you must access `host:port/debug.html` or run `npm run build` to bundle the code.

--------------------------------------------------------------------------------

Special thanks to:

 - [Dopatwo](https://www.youtube.com/user/dopatwo) for the artwork 
 - [Kevin MacLeod](https://www.youtube.com/user/kmmusic) for the soundtrack
 - [Skylent](https://www.youtube.com/dotacardchannel) for the introduction videos

*Powered by*

[![Powered by Github, Heroku, Grunt and Jquery](https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/poweredby-banner.jpg)][1]

[1]: https://foda-app.herokuapp.com/

[2]: https://discord.gg/a4TwjAR

[3]: https://github.com/rafaelcastrocouto/foda/fork

[4]: https://github.com/rafaelcastrocouto/foda/archive/master.zip

[5]: https://github.com/rafaelcastrocouto/dotacard

[6]: https://github.com/rafaelcastrocouto/dotacard/wiki/How-to-develop-a-new-hero

[7]: https://github.com/rafaelcastrocouto/dotacard/wiki

[8]: https://github.com/rafaelcastrocouto/foda/issues/new

[9]: http://www.esrb.org/ratings/ratings_guide.aspx#rating_categories

[10]: https://github.com/rafaelcastrocouto/dotacard/wiki/How-to-setup-a-local-server

[11]: https://play.google.com/store/apps/details?id=fodaapp.herokuapp.com.foda
