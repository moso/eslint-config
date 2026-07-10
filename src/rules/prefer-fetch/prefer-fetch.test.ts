import { runTest } from '../tests';
import module from './prefer-fetch';

runTest({
    module,
    invalid: [
        {
            code: 'import "axios"',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'import "request"',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'new XMLHttpRequest()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'new ActiveXObject("MSXML2.XMLHTTP")',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'new ActiveXObject("Microsoft.XMLHTTP")',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'require("axios")',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'require("request")',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: '$http()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: '$(element).load()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery(element).load()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery.ajax()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery.get()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery.post()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery.getJSON()',
            errors: [{ messageId: 'preferFetch' }],
        },
        {
            code: 'jQuery.getScript()',
            errors: [{ messageId: 'preferFetch' }],
        },
    ],
});
