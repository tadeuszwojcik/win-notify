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

### options:
* `expirationTime`: sets the time after which a toast notification should not be displayed.
* `launch`: string that is passed to the application when it is activated by the toast. The format and contents of this string are defined by the app for its own use. When the user taps or clicks the toast to launch its associated app, the launch string provides the context to the app that allows it to show the user a view relevant to the toast content, rather than launching in its default way.
* `duration` -  the amount of time the toast should display. (can have one of the following values: 'long', 'short')

### Badge update:
```js 
  winNotifier.updateBadge(10);
```
<div>
  <p style='float:right;'>
    sdfsdf
  <p>
</div>

<div style="float: right"><img src="whatever.jpg" /></div>


| 	tile | usage  |
| ------------- |:-------------:|:-----:|
|![alt text](http://i.msdn.microsoft.com/dynimg/IC612766.png "Logo Title Text 1")|dfgdfg|
|![alt text](http://i.msdn.microsoft.com/dynimg/IC665887.jpg "Logo Title Text 1")|dfgdfg|
## License

  [WTFPL](LICENSE.txt)
