# Gordon-UI for Gekko trading bot

This is my personal try to port the original Gekko UI to the Quasar Framework.
It's based off the original code from the [Gekko trading bot](https://gekko.wizb.it/) UI.

Use this parallel to the original Gekko-UI (or compile and replace the original).

*Sidenote: This repository should work with all Gekkos > version 0.6. It's still somehow messy imho - but it works :)*

## Some Features:
- "Tickers" for all running live market-watchers in the top toolbar
- Searchable tables for datasets
- Stop running instances from within the Live-Gekko-Views
- EChart-Candlestick charts for market and backtest-graphs
- some stats for roundtrips
- Material design UI
- Enhanced information for running live-bots (differentiate between live-bot and paper-trader at a glance)
- *DISABLED UNTIL WORKING RELIABLY:* Start Live Gekkos directly from backtester including current selected settings
- when present: **render indicator results to market chart!**
- download backtest data as excel and csv
- and more...

## Usage

### Dev-Mode
Needed:
  - NodeJS >= 7.0
  - running Gekko Instance started as --ui

*Side-Note: I'm running on Windows 10 - so here it's working. Linux sometimes gave me headaches while installing dependencies...*

To install, follow these steps:

1. Install Quasar-CLI via npm `npm install -g quasar-cli`, to make sure, everything is allright, follow the official installation guide to Quasar https://quasar-framework.org/guide/index.html#Development-with-Quasar-CLI-Recommended .
2. Clone this repo to some location on your harddrive (should work from any directory in DEV-Mode).
3. Fire up your gekko in UI-Mode.
4. CD into cloned repository and run `npm install`.
5. Start the UI with `quasar dev`

*Note: If it complains about missing modules, make sure, vue-cli and quasar-cli are properly installed.*

### Compile for replacing the original Gekko-UI
1. Clone this repo.
2. Run `npm install` + ```quasar build``` from this repo.
2. In your gekko-folder zip up the folder `web/vue` as backup.
3. Place everything from repo's `dist/spa-mat` into the `web/vue` folder. (index.html must be there)
4. Modify the first line in `web/routes/baseConfig.js` so that it looks like this `var UIconfig = require('../vue/statics/UiConfig');`
5. Modify the first line in `web/server.js` so that it looks like this `const config = require('./vue/statics/UiConfig');`
6. Modify ~line 87 in web -> server.js:
replace
```
app
  .use(cors())
  .use(serve(WEBROOT + 'vue/dist'))
  .use(bodyParser())
  .use(require('koa-logger')())
  .use(router.routes())
  .use(router.allowedMethods());
```
with
```
app
  .use(cors())
  .use(serve(WEBROOT + 'vue'))
  .use(bodyParser())
  .use(require('koa-logger')())
  .use(router.routes())
  .use(router.allowedMethods());
```
7. Start Gekko with UI command (`node gekko --ui`).
8. Enjoy!

***If you changed your default connection or database-settings, please edit the file ***`<gekko-quasar-ui-folder>/src/statics/UiConfig.js`*** accordingly.***


If you like the ported UI, drop me some coins for coffee ;)

***BTC: 191hR9AftcrGH2Vb29ogPBoUjFowsvAMrk***

## Screenshots

![image1](img/gekko-quasar-1.png?raw=true "Screenshot 1")
![image2](img/gekko-quasar-2.png?raw=true "Screenshot 2")
![image3](img/gekko-quasar-3.png?raw=true "Screenshot 3")
![image4](img/gekko-quasar-4.png?raw=true "Screenshot 4")
![image5](img/gekko-quasar-5.png?raw=true "Screenshot 5")
![image6](img/gekko-quasar-6.png?raw=true "Screenshot 6")
![image7](img/gekko-quasar-7.png?raw=true "Screenshot 7")
![image8](img/gekko-quasar-8.png?raw=true "Screenshot 8")
![image9](img/gekko-quasar-9.png?raw=true "Screenshot 9")

