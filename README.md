#win-notify

 Simple notifications API for JavaScript Windows Store apps.
  
  Compatible with **Windows 8** and **8.1** APIs.

## Why?
**Short version**: because native WinRT notifications
API ([Windows.UI.Notifications](http://msdn.microsoft.com/library/windows/apps/br208661)) 
isn't JavaScript friendly(to put it mildly - [see example below](#using-native-winrt-notifications-api)).

**Longer version**: Everyone who builds Windows Store apps knows that live tiles and toasts notifications 
are great way to engage users.
WinRT API provides way to utilize those features, unfortunately it requires messing with 
XML (yeah XML - [see example below](#using-native-winrt-notifications-api)) and work with API which is more designed for C#/C++ devs.
I was a bit frustrated by the current state of affairs, so written this lib.
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



Let's say we want to update tile with text and image when it's displayed on start screen as 
wide tile and text only when it's displayed as medium tile:

<p align="center">
<img src="https://f.cloud.github.com/assets/1707138/1392451/4f901d72-3c0b-11e3-9c7a-6825eb33055c.PNG" />  &nbsp;
<img src="https://f.cloud.github.com/assets/1707138/1369086/bbfe889c-39d4-11e3-9c42-ef99011ec09f.png"/>

</p>
##### using `win-notify`:
```js
winNotify.viaTileUpdate({
    tileWide310x150SmallImageAndText04: {
      image1: 'http://uifaces.com/faces/_twitter/cacestgang_73.jpg',
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
tileImageAttributes[0].setAttribute("src", "http://uifaces.com/faces/_twitter/cacestgang_73.jpg");

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

Hope you see now which API is **simpler** and why it's worth using `win-notify` in your project.
[Check out API section](#tile-updates) to learn more about details.



### Toast notifications


![toast notifications](https://f.cloud.github.com/assets/1707138/1368910/530fa5ca-39c8-11e3-85a3-f75e6f3e80f8.PNG)


Let's say we want to show toast notification with text and image:
<p align="center">
<img src="https://f.cloud.github.com/assets/1707138/1392452/4fba40ca-3c0b-11e3-8f9f-68147b45b475.PNG" />
</p>

##### using `win-notify`:
```js
winNotify.viaToast({
  toastImageAndText02: {
    text1: 'Hello',
    text2: 'World',
    image1: 'http://uifaces.com/faces/_twitter/cacestgang_73.jpg',
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
toastImageElements[0].setAttribute("src", "http://uifaces.com/faces/_twitter/cacestgang_73.jpg");

var toast = new notifications.ToastNotification(toastXml);
var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
toastNotifier.show(toast);
```

Again, `win-notify` is much **simpler** to use than native WinRT notifications API.
[Check out API section](#toasts-notifications) to learn more about details.


## API
### Tile updates
#### `winNotify.viaTileUpdate(templatesDefinition, [optional] options)`
Updates live tile with new content defined in templates definition.
##### templatesDefinition
It's an object with following structure:

```js
   {
    'templateDefinitio': {
       ... template paremeters
    },
    'TemplateDefinition' : {
      ... template parameters
    }
   }
```
Each `TemplateDefinition` object needs to be valid template name, for example `tileSquare150x150Text04` ((check out tiles templates catalog)[http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx]).
Both camelCase and PascalCase naming conventions are supported. If you want to send update only for one tile type, 
specify only one template definition, if you want to handle more tile types(medium, wide, large etc) specify template definition 
for each of them (it's actually best practise to send updates to all handled by app tile types, as user can change tile type anytime).

###### Template definition object
When you know which template definition from catalog you want to use, `templateDefinition` 
object needs to contain properties for such template and it can be type `text` or `image`.

* `image` - can be simple `string` or `object` with `src`, `alt` and `addImageQuery` properties - 
  (see msdn docs for more details)[http://msdn.microsoft.com/en-us/library/windows/apps/br212855.aspx]

* `text` - can be simple `string` or `object` with `lang` and `text` properties - 
  (see msdn docs for more details)[http://msdn.microsoft.com/en-us/library/windows/apps/br212856.aspx]

Let's say we want to use template `TileSquare150x150PeekImageAndText02`:
It looks like:
```
<tile>
  <visual version="2">
    <binding template="TileSquare150x150PeekImageAndText02" fallback="TileSquarePeekImageAndText02">
      <image id="1" src="image1" alt="alt text"/>
      <text id="1">Text Field 1 (larger text)</text>
      <text id="2">Text Field 2</text>
    </binding>  
  </visual>
</tile>
```
Template definition object for such template looks like:
```js
tileSquare150x150PeekImageAndText02: {
      image1: {
        src:'image1',
        alt:'alt text'
      },
      text1: 'Text Field 1 (larger text)',
      text2: 'Text Field 2'
    }
```
Notice that `image` and `text` properites have proper suffixes which match `id` of element in template xml.





##### options
It's an object with following properties (all optional):
* `addImageQuery` 
* `baseUri`
* `branding`
* `contentId`
* `lang`
* `version`
Read more about each of on (MSDN)[http://msdn.microsoft.com/en-us/library/windows/apps/br212857.aspx]

Additionalally options object can contain following properties:
* `tag` - gets or sets a string that Windows can use to prevent duplicate notification content from appearing in the queue.
* `expirationTime` - gets or sets the time (DateTime) that Windows will remove the notification from the tile.
* `tileId` - if not specified tile update will update application tile, if specified it will update ** secondary tile **
if secondary tile with `tileId` exists

* `deliveryTime` - gets the time (DateTime) at which the tile is scheduled to be updated (applies only to scheduled tile updates).
* `id` - gets or sets the unique ID that is used to identify the scheduled tile in the schedule (applies only to scheduled tile updates).

#### `winNotify.viaScheduledTileUpdate(templatesDefinition, [optional] options)`


#### `winNotify.clearTile([optional] options)`


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



