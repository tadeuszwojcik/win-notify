# win-notifier

  Easy to use notifications for javascript(WinJS etc) windows store apps, no more handcrafting xml in javascript!

## Installation

```
$ npm install win-notifier
```

or

copy file index.js and reference it manually into the project.

## Usage

### Toast notification:

![b4ce4dc4-smush-tiles](https://f.cloud.github.com/assets/1707138/1368882/13e71dee-39c6-11e3-943e-78af855fab64.jpg)
![f538dd67-smush-toasts](https://f.cloud.github.com/assets/1707138/1368883/13ff7038-39c6-11e3-8b64-985fa929467b.jpg)

#### examples
```js
  winNotifier.showToast({
      toastText01: {
          text1: 'Hello!'
      }
  },{
      silent: true,
      tileId:'secondaryTileId'
  });
```

## License

  [WTFPL](LICENSE.txt)
