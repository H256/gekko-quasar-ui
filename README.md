# Gekko - Quasar UI Edition

This is my personal try to port the original Gekko UI to the Quasar Framework. 
It's based off the original code from the [Gekko trading bot](https://gekko.wizb.it/) UI.

## Usage

1. Download (folder: dist/spa-mat) or clone this repo.
2. In your gekko-folder zip up the folder `web/vue` as backup.
3. Place everything from repo's `dist/spa-mat` into the `web/vue` folder. (index.html must be there)
4. Start Gekko with UI command (`node gekko --ui`).
5. Enjoy!


## Developing
To install, follow these steps:

1. Install Quasar-CLI via npm `npm install -g quasar-cli`
2. Clone this repo to some location on your harddrive (should work from any directory in DEV-Mode).
3. Fire up your gekko in UI-Mode.
4. CD into cloned repository and start the UI with `quasar dev`

***If you changed your default connection or database-settings, please edit the file ***`<gekko-quasar-ui-folder>/src/statics/UIConfig.js`*** accordingly.***


If you like the ported UI, drop me some coins for coffee ;)

***BTC: 191hR9AftcrGH2Vb29ogPBoUjFowsvAMrk***

## Screenshots

![homepage](img/gekko-quasar-1.png?raw=true "Gekko Home")
![local-data](img/gekko-quasar-2.png?raw=true "Local data management")
![importer](img/gekko-quasar-3.png?raw=true "Importer Configuration")
![backtester](img/gekko-quasar-4.png?raw=true "Backtester strategy configuration")
![roundtrips](img/gekko-quasar-5.png?raw=true "Backtester roundtrips")




