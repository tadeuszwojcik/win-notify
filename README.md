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
### options:
 * `parser`: which Redis protocol reply parser to use.  Defaults to `hiredis` if that module is installed.


### Badge update:
```js 
  winNotifier.updateBadge(10);
```
## License

  [WTFPL](LICENSE.txt)
