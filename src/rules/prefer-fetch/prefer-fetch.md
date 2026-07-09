# `@moso/prefer-fetch`

Enforce fetch.

## Rule Details

The platform-native `fetch` API (stable in Node >18 and every modern browser) replaces a whole generation of HTTP clients. This rule reports the legacy alternatives: importing or requiring `axios`/`request`, constructing `XMLHttpRequest` or the ancient `ActiveXObject("...XMLHTTP...")`, AngularJS-style `$http(...)` calls, and jQuery AJAX helpers (`$.ajax`, `$.get`, `$.getJSON`, `$.getScript`, `$.post`, `$(el).load`).

## Examples

### ❌ Incorrect

```js
import 'axios';
require('request');

new XMLHttpRequest();
new ActiveXObject('MSXML2.XMLHTTP');

$http.get('/api');
jQuery.ajax({ url: '/api' });
$(element).load('/fragment');
```

### ✅ Correct

```js
const response = await fetch('/api');
const data = await response.json();
```

## When Not To Use It

Projects that must support runtimes without `fetch` (Node <18 without a polyfill) or that rely on client features `fetch` does not cover (axios interceptors, upload progress events via XHR) should disable this rule until they migrate.

## Attributes

- Type: Problem
- [ ] :white_check_mark: Stylistic
- [ ] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/prefer-fetch
