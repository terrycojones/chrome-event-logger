# Chrome Event Logger

CEL, the Chrome Event Logger, logs all Chrome browser API events to the
console of its background page.  It is intended to help developers see the
names of events Chrome is triggering, when they occur, and with what
arguments. Typical use cases are:

1.  You wonder if there is a Chrome API event that's triggered for some
    action you take in the browser. Rather than guessing what the event
    might be and trying to find it in the API docs, you can enable CEL,
    perform the action in Chrome, and see what CEL logs.

1.  You're writing an extension and are unsure about whether an event is
    being triggered or with what arguments. Instead of adding an event
    listener in your own code and reloading your extension, you can just
    look in the CEL log.

## Viewing the logging

Once installed, you can examine the CEL logging by visiting
[chrome://extensions](chrome://extensions), clicking to enable `Developer
mode`, and then clicking the link next to the CEL icon where it says
`Inspect views: _generated_background_page.html`

## Manually adjusting logging

In the JS console for the extension's background page, there are several
commands you can run to adjust what is logged:

```javascript
// Return a list of the chrome.* API events being logged. 
CEL.enabled()

// Return a list of the chrome.* API events being ignored.
CEL.disabled()

// Enable logging of some calls (see below).
CEL.enable(name1, name2, ...)

// Disable logging of some calls (see below).
CEL.disable(name1, name2, ...)
```

The names you pass to `CEL.enable` and `CEL.disable` can be individual API
calls (without the leading "chrome."), or can be higher-level categories.
Here are some examples:

```javascript
// Enable chrome.tabs.onCreated and all chrome.webRequest.* events:
CEL.enable('tabs.onCreated', 'webRequest')

// Disable all chrome.tabs.* events and chrome.webNavigation.onCommitted
CEL.disable('tabs', 'webNavigation.onCommitted')
```

Note that `CEL.enable` will enable all necessary higher level logging. So,
for example, if you call `CEL.enable('omnibox.onInputEntered')` all
`chrome.omnibox.*` events (that have not been explicitly disabled) will be
logged.  If you don't want to enable and disable groups of calls in this
way, always pass explicit API calls.

`CEL.disabled` will show you the names of individual calls that are
disabled, as well as any disabled higher levels.

## Global enable / disable

The extension provides a context menu item that lets you globally enable or
disable logging.

## Installation from a bundled .crx file

You should be able to easily install the extension by visting
https://fluiddb.fluidinfo.com/about/chrome-event-logger/fluidinfo.com/chrome.crx

## Installation from source

The source to the extension is available on Github. Here's how to get and
install it.

* Download the repo: `git clone [http://github.com/terrycojones/chrome-event-logger](http://github.com/terrycojones/chrome-event-logger)`
* In Chrome, go to [chrome://extensions](chrome://extensions).
* Click `Developer mode`.
* Click `Load Unpacked Extension...`
* Navigate to the directory where you cloned the repo and click `Open`.

## Possible TODO

Make it possible for other extensions to add a listener to receive event
information, and (on a per-listener basis) to configure what events they're
called for. This would make it simple for other extension developers to
receive information about Chrome events without needing to open the
background page of CEL.
