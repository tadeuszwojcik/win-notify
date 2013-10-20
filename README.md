win-notify
=====================

  Easy to use notifications for JavaScript Windows Store Apps, no more xml in your js code!

## Why?
## Installation

```sh
$ npm install win-notify
```
```sh
$ bower install win-notify
```
or just copy file win-notify.js file.


## Usage
##### Prerequisites
* reference win-notify.js file

### Tile notifications
![tile notifications](https://f.cloud.github.com/assets/1707138/1368882/13e71dee-39c6-11e3-943e-78af855fab64.jpg)



Let's say we want to update tile, with text and image when it's displayed on start screen as 
wide tile and text only when it's displayed as medium tile:

![screenshot 3](https://f.cloud.github.com/assets/1707138/1369064/0a239e74-39d3-11e3-974f-9bb9aef34a84.png) &nbsp;
![screenshot 5](https://f.cloud.github.com/assets/1707138/1369063/0a2370e8-39d3-11e3-8ea6-0b8336697dae.png)

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

##### using standard WinRT API:
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

Hope you see which one is simpler and why it's worth using `win-notify` in your project.




### Tile notifications
![toast notifications](https://f.cloud.github.com/assets/1707138/1368910/530fa5ca-39c8-11e3-85a3-f75e6f3e80f8.PNG)

```js
winNotify.viaToast({
  toastImageAndText02: {
    text1: 'Hello',
    text2: 'World',
    image1: 'http://www.indianeworld.com/wp-content/uploads/2013/08/hello-world-java-program.png',
  }
});
```

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
## API

## Credits

Thanks Kraig Brockschmidt for images (hope he don't mind) and presentation [Alive with Activity](http://channel9.msdn.com/Events/Build/2013/3-159) explaining notifications concepts in clear way.
## License
  [WTFPL](LICENSE.txt)



