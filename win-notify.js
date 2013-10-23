/**
 * win-notify - Simple notifications API for JavaScript Windows Store apps
 * @version v0.1.0 - 2013-10-24
 * @link http://tadeuszwojcik.github.io/win-notify/
 * @author Tadeusz Wójcik <tadeuszwojcik@gmail.com>
 * @license WTFPL License, https://github.com/tadeuszwojcik/win-notify/blob/master/LICENSE.txt
 */
(function (exports) {
  var TileUpdateManager = Windows.UI.Notifications.TileUpdateManager;
  var TileNotification = Windows.UI.Notifications.TileNotification;
  var TileTemplateType = Windows.UI.Notifications.TileTemplateType;
  var ScheduledTileNotification = Windows.UI.Notifications.ScheduledTileNotification;
  var BadgeUpdateManager = Windows.UI.Notifications.BadgeUpdateManager;
  var BadgeTemplateType = Windows.UI.Notifications.BadgeTemplateType;
  var BadgeNotification = Windows.UI.Notifications.BadgeNotification;
  var ToastNotificationManager = Windows.UI.Notifications.ToastNotificationManager;
  var ToastNotification = Windows.UI.Notifications.ToastNotification;
  var ToastTemplateType = Windows.UI.Notifications.ToastTemplateType;
  var ScheduledToastNotification = Windows.UI.Notifications.ScheduledToastNotification;
  var SecondaryTile = Windows.UI.StartScreen.SecondaryTile;

  var applicationTileUpdater = TileUpdateManager.createTileUpdaterForApplication();
  var applicationBadgeUpdater = BadgeUpdateManager.createBadgeUpdaterForApplication();
  var toastNotifier = ToastNotificationManager.createToastNotifier();

  var secondaryTileUpdaters = {};
  var secondaryBadgeUpdaters = {};

  function unescapeHtml(unsafe) {
    return unsafe
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'");
  }

  function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  function assignImageValuesToXmlAttributes(xml, templateValues) {
    var imageXmlAttributes = xml.getElementsByTagName("image");

    for (var i = 0; i < imageXmlAttributes.length; i++) {
      var imageValue = templateValues['image' + (i + 1)];
      if (!imageValue) continue;

      if (typeof imageValue === 'string') {
        imageXmlAttributes[i].setAttribute("src", imageValue);
      } else {
        imageXmlAttributes[i].setAttribute("src", imageValue.src);
        imageXmlAttributes[i].setAttribute("alt", imageValue.alt);
        imageXmlAttributes[i].setAttribute("addImageQuery", !!imageValue.addImageQuery);
      }
    }
  }

  function assignTextValuesToXmlAttributes(xml, templateValues) {
    var textXmlAttributes = xml.getElementsByTagName("text");

    for (var i = 0; i < textXmlAttributes.length; i++) {
      var textValue = templateValues['text' + (i + 1)];
      if (!textValue) continue;

      if (typeof textValue === 'string') {
        textXmlAttributes[i].appendChild(xml.createTextNode(unescapeHtml(textValue)));
      } else {
        textXmlAttributes[i].setAttribute("lang", textValue.lang);
        textXmlAttributes[i].appendChild(xml.createTextNode(unescapeHtml(textValue.text)));
      }
    }
  }

  function assignMiscValuesToXmlAttribute(xmlElement, templateValues) {
    if (templateValues.branding) xmlElement.setAttribute("branding", templateValues.branding);
    if (templateValues.contentId) xmlElement.setAttribute("contentId", templateValues.contentId);
    if (templateValues.addImageQuery) xmlElement.setAttribute("addImageQuery", templateValues.addImageQuery);
    if (templateValues.baseUri) xmlElement.setAttribute("baseUri", templateValues.baseUri);
    if (templateValues.lang) xmlElement.setAttribute("lang", templateValues.lang);
    if (templateValues.version) xmlElement.setAttribute("version", templateValues.version);
  }

  function assignToastSpecificValuesToXml(xml, values) {
    if (values.launch) xml.firstChild.setAttribute('launch', values.launch);
    if (values.duration) xml.firstChild.setAttribute('duration', values.duration);


    var audioElement = xml.createElement('audio');
    if (values.loop) audioElement.setAttribute('loop', values.loop);
    if (values.silent) audioElement.setAttribute('silent', values.silent);
    if (values.src) audioElement.setAttribute('src', values.src);
    xml.firstChild.appendChild(audioElement);
  }

  function createNotificationXml(templateName, templateValues, templateContentFactory) {
    var templateXml = templateContentFactory(templateName);

    if (!templateXml) throw new Error('Invalid template name: ' + templateName);

    assignImageValuesToXmlAttributes(templateXml, templateValues);
    assignTextValuesToXmlAttributes(templateXml, templateValues);
    assignMiscValuesToXmlAttribute(templateXml.getElementsByTagName("visual")[0], templateValues);

    return templateXml;
  }

  function tileExists(tileId) {
    if (!tileId) return true;

    return SecondaryTile.exists(tileId);
  }

  function performActionOnTileUpdaterIfAllowed(options, action) {
    performActionOnUpdaterIfAllowed(options, secondaryTileUpdaters, applicationTileUpdater, TileUpdateManager.createTileUpdaterForSecondaryTile, action);
  }

  function performActionOnBadgeUpdaterIfAllowed(options, action) {
    performActionOnUpdaterIfAllowed(options, secondaryBadgeUpdaters, applicationBadgeUpdater, BadgeUpdateManager.createBadgeUpdaterForSecondaryTile, action);
  }

  function performActionOnUpdaterIfAllowed(options, cache, defaultUpdater, factory, action) {
    if (!tileExists(options.tileId)) {
      if (options.isDebuggingEnabled) console.log('No pinned tile with id: ', options.tileId);
      return;
    }

    var updater;

    if (!options.tileId) {
      updater = defaultUpdater;
    } else {
      var cachedUpdater = cache[options.tileId];
      if (cachedUpdater) {
        updater = cachedUpdater;
      } else {
        updater = factory(options.tileId);
        cache[options.tileId] = updater;
      }
    }
    action(updater);
  }

  function performNotificationAction(templatesDefinition, options, getTemplateContent, notificationAction) {
    var notificationXml = [];

    for (var templateName in templatesDefinition) {
      notificationXml.push(createNotificationXml(templateName, templatesDefinition[templateName], getTemplateContent));
    }

    var masterTemplateXml = notificationXml.splice(0, 1)[0];
    var visualElementOfMasterTemplateXml = masterTemplateXml.getElementsByTagName("visual")[0];

    notificationXml.forEach(function (xmlWhichNeedsToBeMErgedIntoMasterTemplateXml) {
      var node = masterTemplateXml.importNode(xmlWhichNeedsToBeMErgedIntoMasterTemplateXml.getElementsByTagName("binding")[0], true);
      visualElementOfMasterTemplateXml.appendChild(node);
    });

    assignMiscValuesToXmlAttribute(visualElementOfMasterTemplateXml, options);

    if (options.debug) {
      console.log('notification xml: ', masterTemplateXml.getXml());
    }

    notificationAction(masterTemplateXml);
  }

  function getTileTemplateContent(name) {
    var templateNumber = TileTemplateType[lowercaseFirstLetter(name)];
    if (templateNumber === undefined) throw new Error('Tile template with "' + name + '" name doesn\'t exist');
    return TileUpdateManager.getTemplateContent(templateNumber);
  }

  function updateTile(templatesDefinition, options) {
    options = options || {};

    function notificationAction(xml) {
      var tileNotification = new TileNotification(xml);
      tileNotification.expirationTime = options.expirationTime;
      tileNotification.tag = options.tag;

      performActionOnTileUpdaterIfAllowed(options, function (tileUpdater) {
        tileUpdater.update(tileNotification);
      });
    }


    performNotificationAction(templatesDefinition, options, getTileTemplateContent, notificationAction);
  }

  function scheduleTileUpdate(templatesDefinition, options) {
    options = options || {};

    function notificationAction(xml) {
      var scheduledTileNotification = new ScheduledTileNotification(xml, options.deliveryTime);
      scheduledTileNotification.expirationTime = options.expirationTime;
      scheduledTileNotification.tag = options.tag;
      scheduledTileNotification.id = options.id;

      performActionOnTileUpdaterIfAllowed(options, function (tileUpdater) {
        tileUpdater.scheduleTileUpdate(scheduledTileNotification);
      });
    }

    performNotificationAction(templatesDefinition, options, getTileTemplateContent, notificationAction);
  }

  function clearTile(options) {
    options = options || {};

    performActionOnTileUpdaterIfAllowed(options, function (tileUpdater) {
      tileUpdater.clear();
    });
  }


  function getToastTemplateContent(name) {
    var templateNumber = ToastTemplateType[lowercaseFirstLetter(name)];
    if (templateNumber === undefined) throw new Error('Toast template with "' + name + '" name doesn\'t exist');

    return ToastNotificationManager.getTemplateContent(templateNumber);
  }

  function showToast(templatesDefinition, options) {
    options = options || {};

    function notificationAction(xml) {
      assignToastSpecificValuesToXml(xml, options);
      var toastNotification = new ToastNotification(xml);
      toastNotification.expirationTime = options.expirationTime;
      toastNotification.onactivated = options.onactivated;
      toastNotification.ondismissed = options.ondismissed;
      toastNotification.onfailed = options.onfailed;

      toastNotifier.show(toastNotification);
    }

    performNotificationAction(templatesDefinition, options, getToastTemplateContent, notificationAction);
  }


  function scheduleToastToDisplay(templatesDefinition, options) {
    options = options || {};

    function notificationAction(xml) {
      var scheduledToastNotification = new ScheduledToastNotification(xml, options.deliveryTime);
      scheduledToastNotification.expirationTime = options.expirationTime;
      scheduledToastNotification.id = options.id;
      scheduledToastNotification.onactivated = options.onactivated;
      scheduledToastNotification.ondismissed = options.ondismissed;
      scheduledToastNotification.onfailed = options.onfailed;

      toastNotifier.addToSchedule(scheduledToastNotification);
    }

    performNotificationAction(templatesDefinition, options, getToastTemplateContent, notificationAction);
  }


  function updateBadge(value, options) {
    var badgeXml = BadgeUpdateManager.getTemplateContent(BadgeTemplateType.badgeNumber);
    var badgeAttributes = badgeXml.getElementsByTagName("badge");
    badgeAttributes[0].setAttribute("value", value);


    var badgeNotification = new BadgeNotification(badgeXml);
    if (options.expirationTime) {
      badgeNotification.expirationTime = options.expirationTime;
    }
    if (options.debug) {
      console.log('badge xml: ', badgeXml.getXml());
    }

    performActionOnBadgeUpdaterIfAllowed(options, function (badgeUpdater) {
      badgeUpdater.update(badgeNotification);
    });
  }

  function clearBadge(options) {
    options = options || {};

    performActionOnBadgeUpdaterIfAllowed(options, function (badgeUpdater) {
      badgeUpdater.clear();
    });
  }

  exports.winNotify = {
    viaTileUpdate: updateTile,
    viaScheduledTileUpdate: scheduleTileUpdate,
    clearTile: clearTile,
    viaToast: showToast,
    viaScheduledToast: scheduleToastToDisplay,
    viaBadgeUpdate: updateBadge,
    clearBadge: clearBadge
  };

})(typeof (window) === 'undefined' ? module.exports : window);