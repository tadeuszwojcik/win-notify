win-notify
=====================

  Easy to use notifications for JavaScript Windows Store Apps.
  
  Compatible with **Windows 8** and **8.1** APIs.

## Why?
**Short version**: because native WinRT notifications
API([Windows.UI.Notifications](http://msdn.microsoft.com/library/windows/apps/br208661)) 
isn't JavaScript friendly(to put it mildly - [see example below](#using-native-winrt-notifications-api)).

**Longer version**: Everyone who builds Windows Store apps know that live tiles and toasts notifications 
are great way to engage users.
WinRT API provides way to utilize those features, unfortunately it requires messing with 
XML (yeah XML - [see example below](#using-native-winrt-notifications-api)) and work with API which is more designed for C#/C++ devs.
To mitigate that issue some folks advice to use
[notifications extensions library](http://msdn.microsoft.com/en-us/library/windows/apps/hh969156.aspx)
which has a bit nicer API, but requires compiling C# code in your JavaScript app (**WAT?**).

I was bit frustrated by the current state of affairs, so written this lib.
It's not too abstracted from native WinRT API, 
but provides **much simpler way of working with notifications from Javascript** (at least I hope so).


## Installation

```sh
$ npm install win-notify
```
```sh
$ bower install win-notify
```
or simply copy file win-notify.js file to your project.


## Examples 
### Tile notifications


![tile notifications](https://f.cloud.github.com/assets/1707138/1368882/13e71dee-39c6-11e3-943e-78af855fab64.jpg)



Let's say we want to update tile, with text and image when it's displayed on start screen as 
wide tile and text only when it's displayed as medium tile:

![tile medium](https://f.cloud.github.com/assets/1707138/1369086/bbfe889c-39d4-11e3-9c42-ef99011ec09f.png) &nbsp;
![tile wide](https://f.cloud.github.com/assets/1707138/1369087/bc14292c-39d4-11e3-91cf-f5fef65a2a0f.png)

##### using `win-notify` :
```js
winNotify.viaTileUpdate({
    tileWide310x150SmallImageAndText04: {
      image1: 'http://www.indianeworld.com/wp-content/uploads/2013/08/hello-world-java-program.png',
      text1: 'Hello',
      text2: 'World'
    },
    tileSquareText02: {
      text1: 'Hello',
      text2: 'World'
    }
  }
);
```

##### using native WinRT notifications API:
```js
var Notifications = Windows.UI.Notifications;
var Imaging = Windows.Graphics.Imaging;

var tileXml = Notifications.TileUpdateManager.getTemplateContent(
  Notifications.TileTemplateType.tileWide310x150SmallImageAndText04);

var tileTextAttributes = tileXml.getElementsByTagName("text");
tileTextAttributes[0].appendChild(tileXml.createTextNode("Hello"));
tileTextAttributes[1].appendChild(tileXml.createTextNode("World"));

var tileImageAttributes = tileXml.getElementsByTagName("image");
tileImageAttributes[0].setAttribute("src", "http://www.indianeworld.com/wp-content/uploads/2013/08/hello-world-java-program.png");

var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(
  Notifications.TileTemplateType.tileSquareText02);

var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode("Hello"));
squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode("World"));

var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
tileXml.getElementsByTagName("visual").item(0).appendChild(node);

var tileNotification = new Notifications.TileNotification(tileXml);

var tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
tileUpdater.update(tileNotification);
```

Hope you see now which one is **simpler** and why it's worth using `win-notify` in your project.
See API section to learn more about details.


### Toast notifications


![toast notifications](https://f.cloud.github.com/assets/1707138/1368910/530fa5ca-39c8-11e3-85a3-f75e6f3e80f8.PNG)


Let's say we want to show toast notification with text and image:

![toast](https://f.cloud.github.com/assets/1707138/1369088/bc283fb6-39d4-11e3-8ed2-2deab9383731.png)

##### using `win-notify` :
```js
winNotify.viaToast({
  toastImageAndText02: {
    text1: 'Hello',
    text2: 'World',
    image1: 'http://www.indianeworld.com/wp-content/uploads/2013/08/hello-world-java-program.png',
  }
});
```

##### using native WinRT notifications API:
```js
var notifications = Windows.UI.Notifications;

var template = notifications.ToastTemplateType.toastImageAndText02;
var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);

var toastTextElements = toastXml.getElementsByTagName("text");
toastTextElements[0].innerText = "Hello";
toastTextElements[1].innerText = "World"; 

var toastImageElements = toastXml.getElementsByTagName("image");
toastImageElements[0].setAttribute("src", "http://www.indianeworld.com/wp-content/uploads/2013/08/hello-world-java-program.png");

var toast = new notifications.ToastNotification(toastXml);
var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
toastNotifier.show(toast);
```

Again, `win-notify` is much **simpler** to use than native WinRT notifications API.
See API section to learn more about details.


## API
### Tile updates
#### Prerequisites
### Toasts notifications
### Badge updates


unescapes escaped html automatically

lowercases template names

image src, or src alt, addImageQuery

text, or text lang, cos tu nie gra w kodzie

debugging

secondary tiles

### not implemented by API - scheduled?

Template definitions
options
### `winNotify.viaTileUpdate`

```js
   winNotify.viaTileUpdate({
    'templateName': {
       ... template paremeters
    },
    'templateName' : {
      ... template parameters
    }
   } options);
```


### `winNotify.viaScheduledTileUpdate`
### `winNotify.clearTile`
### `winNotify.viaToast`
### `winNotify.viaScheduledToast`
### `winNotify.viaBadgeUpdate`
### `winNotify.clearBadge`


## Credits

Thanks Kraig Brockschmidt for images (hope he don't mind) and presentation [Alive with Activity](http://channel9.msdn.com/Events/Build/2013/3-159) explaining notifications concepts in clear way.
## License
  [WTFPL](LICENSE.txt)



