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


# API
## Tile updates
#### `winNotify.viaTileUpdate(templatesDefinitions, [optional] options)`
Updates live tile with new content defined in templates definitions.
##### templatesDefinitions
It's an object which contains template definition objects and has following structure:

```js
{
  'templateDefinition': {
     ... template paremeters
  },
  'TemplateDefinition' : {
    ... template parameters
  }
}
```
Every single `templateDefinition` object needs to named after template name from [tile templates catalog](http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx)
(for example `tileSquare150x150Text04`).
Both camelCase and PascalCase naming conventions are supported (both `tileSquare150x150Text04` and `TileSquare150x150Text04` will work). 
If you want to send update only for one tile type, specify only one template definition,
if you want to handle more tile types(medium, wide, large etc) specify template definition 
for each of them (it's best practise to send updates to all handled by app tile types, so if your app 
supports wide and medium tiles send update for both).

When you know which template definition from catalog you want to use, `templateDefinition` 
object needs to contain properties which are template's parameters and those can be of `text` or `image` type.

* `image` - can be simple `string` or `object` with `src`, `alt` and `addImageQuery` properties - 
  [see MSDN for more details](http://msdn.microsoft.com/en-us/library/windows/apps/br212855.aspx)
* `text` - can be simple `string` or `object` with `lang` and `text` properties - 
  [see MSDN for more details](http://msdn.microsoft.com/en-us/library/windows/apps/br212856.aspx)

Let's say we want to use template [`TileSquare150x150PeekImageAndText02`](http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx#TileSquarePeekImageAndText02):

It has following xml definition:
```xml
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
`Templatedefinition` object for such template looks like:
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
Notice that `image` and `text` properites have proper suffixes which match `id` of element in template xml 
(`text1` for text with id=1 etc).

##### options

It's an object with following properties (all optional):
`addImageQuery`, `baseUri`, `branding`, `contentId`, `lang`, `version`
Read more about each of them on [MSDN](http://msdn.microsoft.com/en-us/library/windows/apps/br212857.aspx).

Additionalally options object can contain following properties:
* `tag` - gets or sets a `string` that Windows can use to prevent duplicate notification content from appearing in the queue.
* `expirationTime` - gets or sets the time (`DateTime`) that Windows will remove the notification from the tile.
* `tileId` - if not specified tile update will update application tile, if specified it will update **secondary tile**
if secondary tile with `tileId` exists
* `deliveryTime` - gets the time (DateTime) at which the tile is scheduled to be updated (applies only to scheduled tile updates).
* `id` - gets or sets the unique ID that is used to identify the scheduled tile in the schedule (applies only to scheduled tile updates).
* `debug` - if set to true will `console.log` xml output for debugging purposes




#### `winNotify.viaScheduledTileUpdate(templatesDefinitions, [optional] options)`
Schedules update to live tile with new content defined in templates definition.
Both `TemplatesDefinitions` and `options` objects are the same as for [`winNotify.viaTileUpdate`](#winnotifyviatileupdatetemplatesdefinitions-optional-options) method.

#### `winNotify.clearTile([optional] options)`
Removes all updates and causes the tile to display its default content as declared in the app's manifest.
Optional options object can contain `tileId` property which allows to clear content of secondary tile.



## Toasts notifications
#### `winNotify.viaToast(templatesDefinitions, [optional] options)`
Raises a toast notification.


`Templatesdefinitions` object has the same structure as one from [`winNotify.viaTileUpdate`](#winnotifyviatileupdatetemplatesdefinitions-optional-options) method.
Only template names are changes, and need to match ones
from [toasts template catalog] (http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx).

Let's say we want to use template [`ToastImageAndText04`](http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx#ToastImageAndText04):

It has following `xml` definition:
```xml
<toast>
    <visual>
        <binding template="ToastImageAndText04">
            <image id="1" src="image1" alt="image1"/>
            <text id="1">headlineText</text>
            <text id="2">bodyText1</text>
            <text id="3">bodyText2</text>
        </binding>  
    </visual>
</toast>
```
`Templatedefinition` object for such template looks like:

```js
toastImageAndText04: {
      image1: {
        src:'image1',
        alt:'alt text'
      },
      text1: 'headlineText',
      text2: 'bodyText1',
      text3: 'bodyText2'
    }
```

##### options
Options from [`winNotify.viaTileUpdate`](#winnotifyviatileupdatetemplatesdefinitions-optional-options) apply here as well, additionally you can specify following properties:
* `onactivated`,`ondismissed`, `onfailed` ([MSDN reference](http://msdn.microsoft.com/en-US/library/windows/apps/windows.ui.notifications.toastnotification#events))
* `launch`, `duration` ([MSDN reference](http://msdn.microsoft.com/en-us/library/windows/apps/br230846.aspx))
* `loop`, `silent` `src` ([MSDN reference](http://msdn.microsoft.com/en-us/library/windows/apps/br230842.aspx))

#### `winNotify.viaScheduledToast(templatesDefinitions, [optional] options)`
Schedule toast notification that will display at the scheduled time.
Both `TemplatesDefinitions` and `options` objects are the same as for [`winNotify.viaToast`](#winnotifyviatoasttemplatesdefinition-optional-options) method.


## Badge updates
#### `winNotify.viaBadgeUpdate(value, [optional] options)`
Updates a badge overlay tile.


`Value` is a string and defines badge value ([MSDN referene](http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx)).

`Options` object can contain `tileId` property, so badge update will update badge of secondary tile, not main app tile.

#### `winNotify.clearBadge([optional] options)`
Removes the badge from the tile.
Optional options object can contain `tileId` property which allows to remove badge of secondary tile.

## Credits

Thanks Kraig Brockschmidt for images (hope he don't mind) and presentation [Alive with Activity](http://channel9.msdn.com/Events/Build/2013/3-159) explaining notifications concepts in clear way and Microsoft for MSDN docs.

## License
  [WTFPL](LICENSE.txt)



