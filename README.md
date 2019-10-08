# [Fight Over Dat Ancient][1]

[![Discord Chat Channel](https://foda-app.herokuapp.com/client/img/discord.png)][2]
  [![FODA icon](https://foda-app.herokuapp.com/client/img/campaign/ico_rosh.png)][1]  [![FODA rating](https://foda-app.herokuapp.com/client/img/ratingsymbol_e10.png)][9]

## Source Code

A **card game** with magical heroes, each with unique skills and powerful abilities.

Play for free [online in your browser][1] or check us out on the [Google play app store][11]

Join our community and discuss the game rules at our [Discord Server][2]. 

### Downloads:

 - Windows [FODA-win32-ia32.zip](https://www.dropbox.com/s/kabww6pleqm7a1j/FODA-win32-ia32.zip?dl=0)
 - Mac-OS [FODA-darwin-x64.zip](https://www.dropbox.com/s/b8k8yic4pykhtvy/FODA-darwin-x64.zip?dl=0)
 - Linux [FODA-linux-ia32.zip](https://www.dropbox.com/s/nzn21x1x20kbv2m/FODA-linux-ia32.zip?dl=0)

Feel free to [fork][3] or [download][4] and help build the game!
You can even make a new hero and [win real cash!][6]

Visit our Wiki page where you can learn [how to play with real cards][7] and much more.

All [artwork][5] can be downloaded for free in high resolution. 

Please report any [suggestions, bugs or issues][8] here at github.

[![Fight Over Dat Ancient](https://foda-app.herokuapp.com/client/img/banner.jpg)][1]

## Hacking at Home (or *Local server setup*)

**1**: [Download](http://nodejs.org/download/) and install Node.js

**2**: [Fork](https://github.com/rafaelcastrocouto/dotacard/fork) this repo

**3**: Clone your fork on your machine

**4**: Install the dependencies: `npm install`

**5**: Create a free Mongo DB at mlab.com *(or anywhere to experts)*

**6**: Create an user to your DB *(you can do this, and all DB related setup, in the mlab.com web interface)*

**7**: Create a collection named `collection` in your mongo db.

**8**: Inside the collection, create a document with this content: `{"document": "dotacard"}`

**9**: Set up you environment config copping `EXAMPLE.env` to `.env`, then edit `.env` with your DB connection URL.

**10**: Build client side bundle: `npm run build`

**11**: Run the server: `npm start`

**12**: Happy Hacking!

*(if you don't need a DB to test changes, like Art and UI, set a empty value to MONGO_CONN inside `.env`)*

*(if you change any UI code, you must run `npm run build` to see the result)*

--------------------------------------------------------------------------------

Special thanks to:

 - [Dopatwo](https://www.youtube.com/user/dopatwo) for the artwork 
 - [Kevin MacLeod](https://www.youtube.com/user/kmmusic) for the soundtrack
 - [Skylent](https://www.youtube.com/dotacardchannel) for the introduction videos

*Powered by*

[![Powered by Github, Heroku, Grunt and Jquery](https://foda-app.herokuapp.com/client/img/poweredby-banner.jpg)][1]

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
