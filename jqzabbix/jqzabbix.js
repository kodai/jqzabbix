/*!
 *  jQuery plugin for Zabbix API
 *
 *  jQuery plugin for Zabbix API is a simple and easy-use plugin for jQuery JavaScript Library.
 *  It can be used for development of original Zabbix web application using Zabbix API.
 *
 *  Documentation on Mozaby site http://www.mozaby.com
 *  Issue tracking on GitHub http://github.com/kodai/jqzabbix
 *
 *  jQuery plugin for Zabbix API is Released under the MIT License.
 *  Copyright (c) 2011, Kodai Terashima http://kodai74.blogpot.com.
 *  Mozaby project http://www.mozaby.com
 */


(function($){

$.jqzabbix = function(options) {

// initialize options
options = $.extend({
    // default settings
    url: 'http://localhost/zabbix/api_jsonrpc.php',
    username: 'Admin',
    password: 'zabbix',
    basicauth: false,
    busername: '',
    bpassword: '',
    timeout: 5000,
    limit: 1000,
}, options);

// initialize variables
var rpcid = 0;
var authid = null;
var apiversion = null;
var errormsg = null;

// initialize default ajax options
$.ajaxSetup({
    contentType: 'application/json-rpc',
    dataType: 'json',
    type: 'POST',
    async: false,
    cache: false,
    processData: false,
    timeout: options.timeout,
    url: options.url,
});
// end initialize


function createAjaxOption(method, params, success, error) {

    // check method option
    if (method === null || typeof method === 'undefined') {
        return false;
    }

    // check params option
    if (params === null || typeof params === 'undefined') {
        params = {};
    }

    // default params
    params = $.extend({
        extendoutput: true,
        limit: options.limit
    }, params);

    // merge params with username and password
    $.extend(params, {
        user: options.username,
        password: options.password
    });

    // create sending data
    var data = {
        jsonrpc: '2.0',
        id: ++rpcid,
        auth: authid,
        method: method,
        params: params
    };

    // create AJAX option
    var ajaxOption = {
        data: JSON.stringify(data),
        success: function(response, status) {

            // resuest error
            if (response === null) {
                errormsg = 'Request error!';
            }
            else if ('error' in response) {
                errormsg = response.error;
            }
            
            // resuest success
            else {

                // do success function
                if (success) {
                    success(response, status);
                }
                errormsg = '';
            }
        },
        error: function(response, status) {
            errormsg = status + ' : ' + response.status + ' ' + response.statusText;
        },
        complete: function() {
            if (errormsg && error) {
                error();
            }
        }
    };

    // if use http basic authentication
    if (options.basicauth === true) {
        ajaxOption.username = options.busername;
        ajaxOption.password = options.bpassword;
    }

    return ajaxOption;
}

this.init = function() {
    rpcid = 0;
    authid = null;
    apiversion = null;
    errormsg = null;

    return true;
}

this.setOptions = function(addoptions) {

    options = $.extend(options, addoptions);
}

this.isError = function() {

    if (errormsg) {
        return errormsg;
    }
    else {
        return false;
    }
}

this.sendAjaxRequest = function(method, params, success, error) {

    $.ajax(createAjaxOption(method, params, success, error));
}

this.getApiVersion = function(params, success, error) {

    var method = 'apiinfo.version';
    var successMethod = function(response, status) {
        apiversion = response.result;

        if (success) {
            success(response, status);
        }
    }

    this.sendAjaxRequest(method, params, successMethod, error);
}

this.userLogin = function(params, success, error) {

    // method
    switch (apiversion) {
        case '1.0':
        case '1.1':
        case '1.2':
        case '1.3':
            var method = 'user.authenticate';
            break;
        default:
            return false;
    }

    var successMethod = function(response, status) {
        authid = response.result;

        if (success) {
            success(response, status);
        }
    }

    this.sendAjaxRequest(method, params, successMethod, error);
}

} // end plugin
})(jQuery); // function($)
