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


// Zabbix server API url
var url = 'http://localhost/zabbix/api_jsonrpc.php';

var options = {};
options.url = url;

$(document).ready(function(){

    server = new $.jqzabbix(options);
    server.getApiVersion(null, function(response){
        $('#result').html('<ul><li>Zabbix API Url: '+ url +'</li>' + '<li>API Version: ' + response.result + '</li></ul>');
    });
    
})

function doAuth(form){

    options.username = form.username.value;
    options.password = form.password.value;
    server.setOptions(options);

    server.userLogin(null, function(){
        $('#result').empty();
        viewInputForm();
    },
    errorMethod );
}

function viewInputForm() {

    // hide login form
    $('#login').css({display:'none'});

    var method1 = '';

    $.each(methods, function(key) {
        method1 += '<option value="' + key + '">' + key + '</option>';
    });

    $('#request select.method1').html(method1);
    changeMethod2($('#request select.method1').val());
    $('.parameters').hide();
    $('#request').css({display:'block'});
}

function changeMethod2(value) {

    var method1 = value;

    var methodlist = '';
    $.each(methods[method1], function(key) {
        methodlist += '<option value="' + key + '">' + key + '</option>';
    });

    $('.method2').html(methodlist);
    changeParameters(method1, $('#request select.method2').val());
}

function changeParameters(method1, method2) {

    if (methods[method1][method2].length === 0) {
        $('.parameters').html('Paraneters are not exists or not configured.')
    }
    else {

        var parameterlist = '';

        $.each(methods[method1][method2], function(key, value) {
            parameterlist += '<tr><td>' + value + '</td><td><input type="text" name="' + value + '"/></td></tr>';
        });

        $('.parameters').html('<table>' + parameterlist + '</table>');
    }
}

function doRequest(form) {

    // method
    var method = form.method1.value + '.' +form.method2.value;

    // parameter
    var params = {};

    $('#request .parameters input').each(function(){
        if (this.value){
            params[this.name] = this.value;
        }
    });

    server.sendAjaxRequest(method, params, successMethod, errorMethod);
}

function toggleParameters() {
    $('.parameters').slideToggle();
}

var errorMethod = function() {

    var errormsg = '';

    $.each(server.isError(), function(key, value) {
        errormsg += '<li>' + key + ' : ' + value + '</li>';
    });

    $('#result').html('<ul>' + errormsg + '</ul>');
}


var successMethod = function(response, status) {

    // response is string
    if (typeof(response.result) === 'string' || typeof(response.result) === 'boolean') {
        $('#result').html('<p>'+ response.result +'</p>')
    }

    // response is object 
    else if (typeof(response.result) === 'object') {

        num = 0; // for table header
        var header = '';
        var row = '';
        var contents = '';

        // each data
        $.each(response.result, function() {

            row = '';

            $.each(this, function(key, value) {

                if (num === 0) { header += '<th>' + key + '</th>'; };

                if (typeof value === 'object') {
                    row += '<td>' + JSON.stringify(value) + '</td>'
                }
                else {
                    row += '<td>' + value + '</td>';
                }
            });

            if (num === 0) {
                header = '<tr>' + header + '</tr>';
            }

            contents += '<tr>' + row + '</tr>'
            
            num++;
        });

        if (contents) {
            $('#result').html('<p>Result: '+ response.result.length + '</p><table>' + header + contents + '</table>');
        }
        else {
            $('#result').html('No result')
        }
    }
}

//// method, parameters list
var methods = {

action: {
    'get': ['nodeids','groupids','hostids','triggerids','actionids','mediatypeids','userids','editable','filter','search','startSearch','excludeSearch','output','select_conditions','select_operations','countOutput','preservekeys','sortfield','sortorder','limit'],
    'exixts': ['nodeids','actionid','name'],
    //'create': [],
    //'update': [],
    'delete': ['actionids']
},

alert: {
    'get': ['nodeids','groupids','hostids','alertids','triggerids','eventids','editable','filter','time_from','time_till','output','select_hosts','select_mediatypes','select_users','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    //'create': [],
    'delete': ['alertids']
},

apiinfo: {
    'version': []
},

application: {
    'get': ['nodeids','groupids','hostids','templateids','itemids','applicationids','inherited','templated','monitored','editable','filter','search','startSearch','expandData','output','select_hosts','select_items','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','name','hostid','host'],
    //'create': [],
    //'update': [],
    'delete': ['applicationids']
},

DCheck: {
    'get': ['nodeids','druleids','dhostids','dcheckids','editable','filter','search','startSearch','excludeSearch','output','selectDRules','selectDHosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']
},

DHost: {
    'get': ['nodeids','druleids','dhostids','dserviceids','groupids','hostids','editable','filter','search','startSearch','excludeSearch','output','selectDRules','selectDChecks','selectDServices','selectGroups','selectHosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'delete': ['dhostids']
},

DRule: {
    'get': ['nodeids','druleids','dhostids','dserviceids','dcheckids','editable','filter','search','startSearch','excludeSearch','output','selectDHosts','selectDChecks','selectDServices','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    //'exists': [],
    //'create': [],
    //'update': [],
    'delete': ['druleids']
},

DService: {
    'get': ['nodeids','druleids','dhostids','dserviceids','dcheckids','editable','filter','search','startSearch','excludeSearch','output','selectDRules','selectDChecks','selectDServices','selectDHosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    //'exists': [],
    //'create': [],
    //'update': [],
    'delete': ['dserviceids']
},

event: {
    'get': ['nodeids','groupids','hostids','triggerids','eventids','editable','object','value','source','acknowledged','hide_unknown','time_from','time_till','output','select_hosts','select_triggers','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'acknowledge': ['eventids','message'],
    //'create': [],
    'delete': ['eventids']
},

graph: {
    'get': ['nodeids','groupids','templateids','hostids','graphids','itemids','type','inherited','templated','editable','filter','search','startSearch','excludeSearch','output','select_groups','select_templates','select_hosts','select_items','select_graph_items','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','name','hostid','host'],
    //'create': [],
    //'update': [],
    'delete': ['graphids']
},

graphitem: {
    'get': ['nodeids','graphids','itemids','type','editable','output','expandData','select_graphs','countOutput','graphOutput','preservekeys','sortfield','sortorder','limit']
},

history: {
    'get': ['history','nodeids','hostids','triggerids','itemids','time_from','time_till','editable','filter','pattern','startPattern','excludePattern','output','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'delete': []
},

host: {
    'get': ['nodeids','groupids','hostids','templateids','itemids','triggerids','graphids','proxyids','maintenanceids','dhostids','dserviceids','monitored_hosts','templated_hosts','proxy_hosts','with_items','with_monitored_items','with_historical_items','with_triggers','with_monitored_triggers','with_httptests','with_monitored_httptests','with_graphs','editable','filter','search','startSearch','excludeSearch','output','select_graphs','selectParentTemplates','select_items','select_triggers','select_graphs','select_applications','select_macros','select_profile','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','hostid','host'],
    //'create': [],
    //'update': [],
    'delete': ['hostids'],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': []
},

hostgroup: {
    'get': ['nodeids','groupods','hostids','templateids','triggerids','graphids','proxyids','maintenanceids','monitored_hosts','templated_hosts','real_hosts','not_proxy_hosts','with_items','with_monitored_items','with_historucal_items','with_triggers','woth_monitored_triggers','with_httptests','with_monitored_httptests','with_graphs','editable','filter','search','startSearch','excludeSearch','output','select_templates','select_hosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','groupid','name'],
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': ['groupids']
},

image: {
    'get': ['nodeids','imageids','sysmapids','editable','filter','pattern','startPattern','excludePattern','output','select_image','countOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','imageid','name','imagetype'],
    //'create': [],
    //'update': [],
    'delete': ['imageids']
},

item: {
    'get': ['nodeids','groupods','hostids','templateids','proxyids','itemids','graphids','triggerids','applicationids','webitems','inherited','templated','monitored','editable','filter','group','host','application','belongs','with_triggers','search','startSearch','excludeSearch','output','select_hosts','select_triggers','select_graphs','select_applications','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','key_','hostid','host'],
    //'create': [],
    //'update': [],
    'delete': ['itemids']
},

maintenance: {
    'get': ['nodeids','groupids','hostids','maintenanceids','editable','filter','pattern','startPattern','excludePattern','output','select_groups','select_hosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','maintenanceid','maintenance'],
    //'create': [],
    //'update': [],
    'delete': ['maintenanceids']
},

map: {
    'get': ['nodeids','sysmapids','editable','filter','search','startSearch','excludeSearch','output','select_selements','select_links','countOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','sysmapid','name'],
    //'create': [],
    //'update': [],
    'delete': ['sysmapids']
},

mediatype: {
    'get': ['nodeids','userids','mediaids','mediatypeids','editable','filter','search','startSearch','excludeSearch','output','select_users','select_medias','countOutput','preservekeys','sortfield','sortorder','limit'],
    //'create': [],
    //'update': [],
    'delete': ['mediatypeids']
},

proxy: {
    'get': ['nodeids','proxyids','editable','filter','search','startSearch','excludeSearch','output','select_hosts','countOutput','preservekeys','sortfield','sortorder','limit'],
    //'create': [],
    'delete': ['proxyids']
},

screen: {
    'get': ['nodeids','screenids','screenitemids','type','editable','filter','search','startSearch','excludeSearch','output','select_screenitems','countOutput','preservekeys','sortfield','sortOrder','limit'],
    'exists': ['nodeids','screenid','name'],
    //'create': [],
    //'update': [],
    'delete': ['screenids']
},

script : {
    'get': ['nodeids','groupids','hostids','scriptids','editable','filter','search','startSearch','excludeSearch','output','select_groups','select_hosts','countOutput','preservekeys','sortfield','sortorder','limit'],
    'execute': ['scriptid','hostid'],
    //'create': [],
    //'update': [],
    'delete': ['scriptids']
},

template: {
    'get': ['nodeids','groupids','templateids','parentTemplateids','hostids','itemids','triggerids','graphids','proxyids','maitenanceids','with_items','with_triggers','with_graphs','editable','filter','search','startSearch','excludeSrarch','output','select_groups','selectParentTemplates','select_templates','select_hosts','select_items','select_triggers','select_graphs','select_applications','select_macros','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','hostid','host'],
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': ['templateids']
},

trigger: {
    'get': ['nodeids','groupids','templateids','hostids','triggerids','itemids','applicationids','functions','inherited','templated','monitored','active','maintenance','withUnacknowledgedEvents','withAcknowledgedEvents','withLastEventUnacknowledged','skipDependent','editable','lastChangeSince','lastChangeTill','filter','group','host','only_true','min_severity','search','startSearch','excludeSearch','output','expandData','expandDescription','select_groups','select_hosts','select_items','select_functions','select_dependencies','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','description','expression','hostid','host'],
    //'create': [],
    //'update': [],
    'delete': ['triggerids'],
    'addDependencies': ['triggerid','dependsOnTriggerid'],
    'deleteDependencies': ['triggerids']
},

user: {
    'get': ['nodeids','usrgrpids','userids','mediaids','mediatypeids','editable','filter','search','startSearch','excludeSearch','output','select_usrgrps','select_medias','select_mediatypes','get_graphs','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit'],
    //'create': [],
    //'update': [],
    //'updateProfile': [],
    'delete': ['userids'],
    //'addMedia': [],
    //'updateMedia': [],
    //'deleteMedia': [],
    'authenticate': [],
    'login': ['user','password'],
    'logout': []
},

usergroup: {
    'get': ['nodeids','usrgrpids','userids','status','with_gui_access','with_api_access','editable','filter','pattern','startPattern','excludePattern','select_users','output','countOutput','preservekeys','sortfield','sortorder','limit'],
    'exists': ['nodeids','usrgrpid','name'],
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': ['usrgrpids']
},

usermacro: {
    'get': ['nodeids','groupids','hostids','templateids','hostmacroids','globalmacroids','globalmacro','editable','filter','pattern','startPattern','excludePattern','output','select_groups','select_hosts','select_templates','countOutput','preservekeys','sortfield','sortorder','limit'],
    //'createGlobal': [],
    //'updateGlobal': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'deleteGlobal': ['grobalmacroids'],
    'deleteHostMacro': ['hostmacroids']
}
// end parameters
};
