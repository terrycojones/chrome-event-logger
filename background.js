var CEL = {

    // Add keys (with any value) to disabled if you want certain things to
    // be disabled on startup. E.g.:
    // disabled = {'tabs': true, 'cookies.onChanged': true}
    _disabled: {},
    globallyEnabled: true,

    allNames: function(name){
        var i, names = [], parts = name.split('.'), thisName = '';
        for (i = 0; i < parts.length; i++){
            thisName += (i ? '.' : '') + parts[i];
            names.push(thisName);
        }
        return names;
    },

    isEnabled: function(name){
        if (name){
        var i, names = this.allNames(name);
        for (i = 0; i < names.length; i++){
            if (this._disabled.hasOwnProperty(names[i])){
                return false;
            }
        }
        return true;
        }
        else {
            console.log('isEnabled called with name = ', name);
        }
    },

    enable: function(){
        var i, arg, names;
        for (arg = 0; arg < arguments.length; arg++){
            names = this.allNames(arguments[arg]);
            for (i = 0; i < names.length; i++){
                delete this._disabled[names[i]];
            }
        }
        this.updateMenuItem();
        return true;
    },

    disable: function(){
        var arg;
        for (arg = 0; arg < arguments.length; arg++){
            this._disabled[arguments[arg]] = true;
        }
        this.updateMenuItem();
        return true;
    },

    enabled: function(){
        var i, name, result = [];

        for (i = 0; i < this.events.length; i++){
            name = this.events[i][1];
            if (this.isEnabled(name)){
                result.push(name);
            }
        }
        return result;
    },

    disabled: function(){
        var name, result = [];
        for (var name in this._disabled){
            result.push(name);
        }
        return result;
    },

    counts: function(){
        var i, name, enabled = 0;
        for (i = 0; i < this.events.length; i++){
            name = this.events[i][1];
            if (this.isEnabled(name)){
                enabled++;
            }
        }
        return [enabled, this.events.length - enabled];
    },

    init: function(){
        var i;

        this.menuItem = chrome.contextMenus.create({
            title: this.contextMenuTitle(),
            checked: true,
            contexts: ['all'],
            type: 'checkbox',
            onclick : function(info, tab){
                this.globallyEnabled = info.checked;
                this.updateMenuItem();
                console.log('CEL logging globally ' +
                            (info.checked ? 'enabled.' : 'disabled.'));
            }.bind(this)
        });

        for (i = 0; i < this.events.length; i++){
            this.register(this.events[i]);
        }
        console.log('Added listeners for ' + i + ' Chrome events.');
    },

    register: function(eventInfo){
        var func = eventInfo[0], name = eventInfo[1];
        var listener = function(){
            var args, i;
            if (this.globallyEnabled && this.isEnabled(name)){
                args = ['EVENT: ' + name];
                if (eventInfo.length > 2){
                    args.push('ARGS:');
                }
                for (i = 2; i < eventInfo.length; i++){
                    args.push(eventInfo[i] + '=');
                    args.push(arguments[i - 2]);
                }
                console.log.apply(console, args);
            }
        }.bind(this);
        if (name.slice(0, 11) === 'webRequest.'){
            // chrome.webRequest.* api calls need a filter arg.
            func.addListener(listener, {urls: ['<all_urls>']});
        }
        else {
            func.addListener(listener);
        }
    },

    contextMenuTitle: function(){
        if (this.globallyEnabled){
            var counts = this.counts();
            return ('Logging ' + counts[0] + ' event' + 
                    (counts[0] === 1 ? '' : 's') + ', ' +
                    counts[1] + ' disabled.');
        }
        else {
            return 'Disabled, click to enable.';
        }
    },

    updateMenuItem: function(){
        chrome.contextMenus.update(
            this.menuItem, {
                checked: this.globallyEnabled,
                title: this.contextMenuTitle(),
                type: 'checkbox'
            }
        );
    },

    events: [
        [chrome.alarms.onAlarm, 'alarms.onAlarm', 'alarm'],
        [chrome.bookmarks.onChanged, 'bookmarks.onChanged', 'id', 'changeInfo'],
        [chrome.bookmarks.onChildrenReordered, 'bookmarks.onChildrenReordered', 'id', 'reorderInfo'],
        [chrome.bookmarks.onCreated, 'bookmarks.onCreated', 'id', 'bookmark'],
        [chrome.bookmarks.onImportBegan, 'bookmarks.onImportBegan'],
        [chrome.bookmarks.onImportEnded, 'bookmarks.onImportEnded'],
        [chrome.bookmarks.onMoved, 'bookmarks.onMoved', 'id', 'moveInfo'],
        [chrome.bookmarks.onRemoved, 'bookmarks.onRemoved', 'id', 'removeInfo'],
        [chrome.browserAction.onClicked, 'browserAction.onClicked', 'tab'],
        [chrome.commands.onCommand, 'commands.onCommand', 'command'],
        [chrome.contextMenus.onClicked, 'contextMenus.onClicked', 'info', 'tab'],
        [chrome.cookies.onChanged, 'cookies.onChanged', 'changeInfo'],
        [chrome.debugger.onDetach, 'debugger.onDetach', 'source', 'reason'],
        [chrome.debugger.onEvent, 'debugger.onEvent', 'source', 'method', 'params'],
        // [chrome.declarativeWebRequest.onRequest, 'declarativeWebRequest.onRequest'], // Only in early release and beta release channels.
        // [chrome.devtools.inspectedWindow.onResourceAdded, 'devtools.inspectedWindow.onResourceAdded', 'resource'],
        // [chrome.devtools.inspectedWindow.onResourceContentCommitted, 'devtools.inspectedWindow.onResourceContentCommitted', 'resource', 'content'],
        // [chrome.devtools.network.onRequestFinished, 'devtools.network.onRequestFinished', 'request'],
        // [chrome.devtools.network.onNavigated, 'devtools.network.onNavigated', 'ur'],
        // [chrome.fileBrowserHandler.onExecute, 'fileBrowserHandler.onExecute'],  // Only available on Chrome OS.
        [chrome.downloads.onChanged, 'downloads.onChanged', 'downloadDelta'],
        [chrome.downloads.onCreated, 'downloads.onCreated', 'downloadItem'],
        [chrome.downloads.onErased, 'downloads.onErased', 'downloadId'],
        [chrome.extension.onConnect, 'extension.onConnect', 'port'],
        [chrome.extension.onConnectExternal, 'extension.onConnectExternal', 'port'],
        [chrome.extension.onMessage, 'extension.onMessage', 'message', 'sender', 'sendResponse'],
        [chrome.extension.onMessageExternal, 'extension.onMessageExternal', 'message', 'sender', 'sendResponse'],
        [chrome.fontSettings.onDefaultFixedFontSizeChanged, 'fontSettings.onDefaultFixedFontSizeChanged', 'details'],
        [chrome.fontSettings.onDefaultFontSizeChanged, 'fontSettings.onDefaultFontSizeChanged', 'details'],
        [chrome.fontSettings.onFontChanged, 'fontSettings.onFontChanged', 'details'],
        [chrome.fontSettings.onMinimumFontSizeChanged, 'fontSettings.onMinimumFontSizeChanged', 'details'],
        [chrome.history.onVisitRemoved, 'history.onVisitRemoved', 'removed'],
        [chrome.history.onVisited, 'history.onVisited', 'result'],
        [chrome.idle.onStateChanged, 'idle.onStateChanged', 'newState'],
        // [chrome.input.ime.onActivate, 'input.ime.onActivate', 'engineID'],
        // [chrome.input.ime.onBlur, 'input.ime.onBlur', 'contextID'],
        // [chrome.input.ime.onCandidateClicked, 'input.ime.onCandidateClicked', 'engineID', 'candidateID', 'button'],
        // [chrome.input.ime.onDeactivated, 'input.ime.onDeactivated', 'engineID'],
        // [chrome.input.ime.onFocus, 'input.ime.onFocus', 'context'],
        // [chrome.input.ime.onInputContextUpdate, 'input.ime.onInputContextUpdate', 'context'],
        // [chrome.input.ime.onKeyEvent, 'input.ime.onKeyEvent', 'engineID', 'keyData'],
        // [chrome.input.ime.onMenuItemActivated, 'input.ime.onMenuItemActivated', 'engineID', 'name'],
        [chrome.management.onDisabled, 'management.onDisabled', 'info'],
        [chrome.management.onEnabled, 'management.onEnabled', 'info'],
        [chrome.management.onInstalled, 'management.onInstalled', 'info'],
        [chrome.management.onUninstalled, 'management.onUninstalled', 'id'],
        [chrome.omnibox.onInputCancelled, 'omnibox.onInputCancelled'],
        [chrome.omnibox.onInputChanged, 'omnibox.onInputChanged', 'text', 'suggest'],
        [chrome.omnibox.onInputEntered, 'omnibox.onInputEntered', 'text'],
        [chrome.omnibox.onInputStarted, 'omnibox.onInputStarted'],
        [chrome.pageAction.onClicked, 'pageAction.onClicked', 'tab'],
        [chrome.permissions.onAdded, 'permissions.onAdded', 'permissions'],
        [chrome.permissions.onRemoved, 'permissions.onRemoved', 'permissions'],
        [chrome.proxy.onProxyError, 'proxy.onProxyError', 'details'],
        // [chrome.pushMessaging.onMessage, 'pushMessaging.onMessage', 'message'],
        [chrome.runtime.onInstalled, 'runtime.onInstalled', 'details'],
        [chrome.runtime.onStartup, 'runtime.onStartup'],
        [chrome.runtime.onSuspendCanceled, 'runtime.onSuspendCanceled'],
        [chrome.runtime.onSuspend, 'runtime.onSuspend'],
        [chrome.scriptBadge.onClicked, 'scriptBadge.onClicked', 'tab'],
        [chrome.storage.onChanged, 'storage.onChanged', 'changes', 'areaName'],
        [chrome.tabs.onActivated, 'tabs.onActivated', 'activeInfo'],
        [chrome.tabs.onAttached, 'tabs.onAttached', 'tabId', 'attachInfo'],
        [chrome.tabs.onCreated, 'tabs.onCreated', 'tab'],
        [chrome.tabs.onDetached, 'tabs.onDetached', 'tabId', 'detachInfo'],
        [chrome.tabs.onHighlighted, 'tabs.onHighlighted', 'highlightInfo'],
        [chrome.tabs.onMoved, 'tabs.onMoved', 'tabId', 'moveInfo'],
        [chrome.tabs.onRemoved, 'tabs.onRemoved', 'tabId', 'removeInfo'],
        [chrome.tabs.onUpdated, 'tabs.onUpdated', 'tabId', 'changeInfo', 'tab'],
        [chrome.ttsEngine.onSpeak, 'ttsEngine.onSpeak', 'utterance', 'options', 'sendTtsEvent'],
        [chrome.ttsEngine.onStop, 'ttsEngine.onStop'],
        [chrome.webNavigation.onBeforeNavigate, 'webNavigation.onBeforeNavigate', 'details'],
        [chrome.webNavigation.onCommitted, 'webNavigation.onCommitted', 'details'],
        [chrome.webNavigation.onCompleted, 'webNavigation.onCompleted', 'details'],
        [chrome.webNavigation.onCreatedNavigationTarget, 'webNavigation.onCreatedNavigationTarget', 'details'],
        [chrome.webNavigation.onDOMContentLoaded, 'webNavigation.onDOMContentLoaded', 'details'],
        [chrome.webNavigation.onErrorOccurred, 'webNavigation.onErrorOccurred', 'details'],
        [chrome.webNavigation.onHistoryStateUpdated, 'webNavigation.onHistoryStateUpdated', 'details'],
        [chrome.webNavigation.onReferenceFragmentUpdated, 'webNavigation.onReferenceFragmentUpdated', 'details'],
        [chrome.webNavigation.onTabReplaced, 'webNavigation.onTabReplaced', 'details'],
        [chrome.webRequest.onAuthRequired, 'webRequest.onAuthRequired', 'details', 'callback'],
        [chrome.webRequest.onBeforeRedirect, 'webRequest.onBeforeRedirect', 'details'],
        [chrome.webRequest.onBeforeRequest, 'webRequest.onBeforeRequest', 'details'],
        [chrome.webRequest.onBeforeSendHeaders, 'webRequest.onBeforeSendHeaders', 'details'],
        [chrome.webRequest.onCompleted, 'webRequest.onCompleted', 'details'],
        [chrome.webRequest.onErrorOccurred, 'webRequest.onErrorOccurred', 'details'],
        [chrome.webRequest.onHeadersReceived, 'webRequest.onHeadersReceived', 'deails'],
        [chrome.webRequest.onResponseStarted, 'webRequest.onResponseStarted', 'details'],
        [chrome.webRequest.onSendHeaders, 'webRequest.onSendHeaders', 'details'],
        [chrome.windows.onCreated, 'windows.onCreated', 'window'],
        [chrome.windows.onFocusChanged, 'windows.onFocusChanged', 'windowId'],
        [chrome.windows.onRemoved, 'windows.onRemoved', 'windowId']
    ],
};

CEL.init();
