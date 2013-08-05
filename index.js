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
                textXmlAttributes[i].appendChild(xml.createTextNode(textValue));
            } else {
                textXmlAttributes[i].setAttribute("lang", textValue.lang);
                textXmlAttributes[i].appendChild(xml.createTextNode(textValue));
            }
        }
    }

    function assignMiscValuesToXmlAttribute(xmlElement, templateValues) {
        if (templateValues.branding) xmlElement.setAttribute("branding", templateValues.branding);
        if (templateValues.contentId) xmlElement.setAttribute("contentId", templateValues.contentId);
        if (templateValues.addImageQuery) xmlElement.setAttribute("addImageQuery", templateValues.addImageQuery);
        if (templateValues.baseUri) xmlElement.setAttribute("baseUri", templateValues.baseUri);
        if (templateValues.fallback) xmlElement.setAttribute("fallback", templateValues.fallback);
        if (templateValues.lang) xmlElement.setAttribute("lang", templateValues.lang);
        if (templateValues.version) xmlElement.setAttribute("version", templateValues.version);
    }

    function assignToastSpecificValuesToXml(xml, values) {
        if (values.launch) xml.firstChild.setAttribute('launch', values.launch);
        if (values.duration) xml.firstChild.setAttribute('duration', values.duration);

        
        var audioElement = xml.createElement('audio');
        if (values.loop) audioElement.setAttribute('loop', values.loop);
        if (values.silent) audioElement.setAttribute('silent', values.silent);
        if (values.src) audioElement.setAttribute('src', 'ms-winsoundevent:' + values.src);
        xml.firstChild.appendChild(audioElement);
    }

    function createNotificationXml(templateName, templateValues, templateContentFactory) {
        var templateXml = templateContentFactory(templateName);

        if (!templateXml) throw new Error('Invalid template name: ' + templateName);

        assignImageValuesToXmlAttributes(templateXml, templateValues);
        assignTextValuesToXmlAttributes(templateXml, templateValues);
        assignMiscValuesToXmlAttribute(templateXml.getElementsByTagName("binding")[0], templateValues);

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

        notificationXml.forEach(function(xmlWhichNeedsToBeMErgedIntoMasterTemplateXml) {
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
        var templateNumber = TileTemplateType[name];
        return TileUpdateManager.getTemplateContent(templateNumber);
    }

    function updateTile(templatesDefinition, options) {
        options = options || {};

        function notificationAction(xml) {
            var tileNotification = TileNotification(xml);
            tileNotification.expirationTime = options.expirationTime;
            tileNotification.tag = options.tag;

            performActionOnTileUpdaterIfAllowed(options, function(tileUpdater) {
                tileUpdater.update(tileNotification);
            });
        }


        performNotificationAction(templatesDefinition, options, getTileTemplateContent, notificationAction);
    }

    function scheduleTileUpdate(templatesDefinition, options) {
        options = options || {};

        function notificationAction(xml) {
            var scheduledTileNotification = ScheduledTileNotification(xml, options.deliveryTime);
            scheduledTileNotification.expirationTime = options.expirationTime;
            scheduledTileNotification.tag = options.tag;
            scheduledTileNotification.id = options.id;

            performActionOnTileUpdaterIfAllowed(options, function(tileUpdater) {
                tileUpdater.scheduleTileUpdate(scheduledTileNotification);
            });
        }

        performNotificationAction(templatesDefinition, options, getTileTemplateContent, notificationAction);
    }

    function clearTile(options) {
        options = options || {};

        performActionOnTileUpdaterIfAllowed(options, function(tileUpdater) {
            tileUpdater.clear();
        });
    }


    function getToastTemplateContent(name) {
        var templateNumber = ToastTemplateType[name];

        return ToastNotificationManager.getTemplateContent(templateNumber);
    }

    function showToast(templatesDefinition, options) {
        options = options || {};

        function notificationAction(xml) {
            assignToastSpecificValuesToXml(xml, options);
            var toastNotification = ToastNotification(xml);
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
            var scheduledToastNotification = ScheduledToastNotification(xml, options.deliveryTime);
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

        performActionOnBadgeUpdaterIfAllowed(options, function(badgeUpdater) {
            badgeUpdater.update(badgeNotification);
        });
    }

    function clearBadge(options) {
        options = options || {};
        performActionOnBadgeUpdaterIfAllowed(options, function(badgeUpdater) {
            badgeUpdater.clear();
        });
    }

    exports.winNotifier = {
        updateTile: updateTile,
        scheduleTileUpdate: scheduleTileUpdate,
        clearTile: clearTile,
        showToast: showToast,
        scheduleToastToDisplay: scheduleToastToDisplay,
        updateBadge: updateBadge,
        clearBadge: clearBadge
    };

})(typeof(window) === 'undefined' ? module.exports : window);