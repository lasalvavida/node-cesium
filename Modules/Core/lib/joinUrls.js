'use strict';

var Uri = require('urijs');
var defaultValue = require('./defaultValue');
var defined = require('./defined');
var DeveloperError = require('./DeveloperError');

/**
 * Function for joining URLs in a manner that is aware of query strings and fragments.
 * This is useful when the base URL has a query string that needs to be maintained
 * (e.g. a presigned base URL).
 * @param {String|Uri} first The base URL.
 * @param {String|Uri} second The URL path to join to the base URL.  If this URL is absolute, it is returned unmodified.
 * @param {Boolean} [appendSlash=true] The boolean determining whether there should be a forward slash between first and second.
 * @private
 */
function joinUrls(first, second, appendSlash) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(first)) {
        throw new DeveloperError('first is required');
    }
    if (!defined(second)) {
        throw new DeveloperError('second is required');
    }
    //>>includeEnd('debug');

    appendSlash = defaultValue(appendSlash, true);

    if (!(first instanceof Uri)) {
        first = new Uri(first);
    }

    if (!(second instanceof Uri)) {
        second = new Uri(second);
    }

    // Uri.isAbsolute returns false for a URL like '//foo.com'.  So if we have an.authority() but
    // not a scheme, add a scheme matching the page's scheme.
    if (defined(second.authority) && !defined(second.scheme)) {
        if (typeof document !== 'undefined' && defined(document.location) && defined(document.location.href)) {
            second.scheme = new Uri(document.location.href).protocol();
        } else {
            // Not in a browser?  Use the first URL's scheme instead.
            second.scheme = first.scheme;
        }
    }

    // If the second URL is absolute, use it for the scheme, authority, and path.
    var baseUri = first;
    if (second.isAbsolute()) {
        baseUri = second;
    }

    var url = '';
    if (defined(baseUri.protocol())) {
        url += baseUri.protocol() + ':';
    }
    if (defined(baseUri.authority())) {
        url += '//' + baseUri.authority();

        if (baseUri.path !== '' && baseUri.path !== '/') {
            url = url.replace(/\/?$/, '/');
            baseUri.path = baseUri.path.replace(/^\/?/g, '');
        }
    }

    // Combine the paths (only if second is relative).
    if (baseUri === first) {
        if (appendSlash) {
            url += first.path.replace(/\/?$/, '/') + second.path.replace(/^\/?/g, '');
        } else {
            url += first.path + second.path;
        }
    } else {
        url += second.path;
    }

    // Combine the queries and fragments.
    var hasFirstQuery = defined(first.query);
    var hasSecondQuery = defined(second.query);
    if (hasFirstQuery && hasSecondQuery) {
        url += '?' + first.query + '&' + second.query;
    } else if (hasFirstQuery && !hasSecondQuery) {
        url += '?' + first.query;
    } else if (!hasFirstQuery && hasSecondQuery) {
        url += '?' + second.query;
    }

    var hasSecondFragment = defined(second.fragment);
    if (defined(first.fragment) && !hasSecondFragment) {
        url += '#' + first.fragment;
    } else if (hasSecondFragment) {
        url += '#' + second.fragment;
    }

    return url;
}

module.exports = joinUrls;

