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
var url = '';
var options = {};
$(document).ready(function(){
    $('#result').html('<ul><li>Zabbix API Url: '+ $("input[name='url']").val() +'</li></ul>');
})

function doAuth(form){
    url=$.trim($("input[name='url']").val());
    options.url = url;
    server = new $.jqzabbix(options);
    server.getApiVersion(null, function(response){
        $('#result').html('<ul><li>Zabbix API Url: '+  +'</li>' + '<li>API Version: ' + response.result + '</li></ul>');
    });
    options.username = form.username.value;
    options.password = form.password.value;
    server.userLogin({user:options.username,password:options.password}, function(){
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
        $('.parameters').html('Parameters do not exist or are not configured.')
    }
    else {

        var parameterlist = '';
        if(methods[method1][method2].type=="object"){
                $.each(methods[method1][method2]["value"], function(key, value) {
                parameterlist += '<tr><td>' + value + '</td><td><input type="text" name="' + value + '"/></td></tr>';
            });
        }else if(methods[method1][method2].type=='array'){
            parameterlist+="<tr><td colspan='2'><input type='text'/></td></tr>";
        }
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
            if(this.value.indexOf("[")==0&&this.value.lastIndexOf("]")==this.value.length-1){
               if(this.name){
                params[this.name] = eval(this.value);
               }else{
                   params=eval(this.value);
               }
            } else if(this.value.indexOf("{")==0&&this.value.lastIndexOf("}")==this.value.length-1){
                if(this.name){
                   params[this.name] = JSON.parse(this.value);
                }else{
                    params=JSON.parse(this.value);
                }
            }else {
                if(this.name){
                    params[this.name] = this.value;
                }else{
                    params=this.value;
                }
            }
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
            $('#result').html('<p>response: '+ JSON.stringify(response) + '</p><table>' + header + contents + '</table>');
        }
        else {
            $('#result').html('No result')
        }
    }
}

//// method, parameters list
var methods = {

action: {
    'get': {"type":"object","value":['actionids','groupids','hostids','triggerids','mediatypeids','usrgrpids','userids','scriptids','selectConditions','selectOperations','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exixts': {"type":"object","value":['actionid','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

alert: {
    'get': {"type:":"object","value":['alertids','actionids','eventids','groupids','hostids','mediatypeids','objectids','userids','eventobject','eventsource','time_from','time_till','selectHosts','selectMediatypes','selectUsers','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    //'create': [],
},

apiinfo: {
    'version': {"type":"array"}
},

application: {
    'get': {"type":"object","value":['applicationids','groupids','hostids','inherited','itemids','templated','templateids','expandData','selectHosts','selectItems','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['hostid','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

DHost: {
    'get': {"type":"object","value":['dhostids','druleids','dserviceids','selectDRules','selectDServices','limitSelects','sortfield','countOutput','editable','excludeSearch','filter','limit',,'output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['dhostid']}
},

DService: {
    'get': {"type":"object","value":['dserviceids','dhostids','dcheckids','druleids','selectDRules','selectDHosts','selectHosts','limitSelects','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['dserviceid']}
    //'create': [],
    //'update': [],
},

DCheck: {
    'get': {"type":"object","value":['dcheckids','druleids','dserviceids','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']}
},

Drule: {
    'get': {"type":"object","value":['dhostids','druleids','dserviceids','selectDChecks','selectDHosts','limitSelects','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['druleids','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

event: {
    'get': {"type":"object","value":['eventids','groupids','hostids','objectids','object','acknowledged','eventid_from','eventid_till','source','time_from','time_till','value','selectHosts','selectRelatedObject','select_alerts','select_acknowledges','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'acknowledge': {"type":"object","value":['eventids','message']}
    //'create': [],
},

graph: {
    'get': {"type":"object","value":['graphids','groupids','templateids','hostids','itemids','templated','inherited','expandName','selectGroups','selectTemplates','selectHosts','selectItems','selectGraphItems','selectDiscoveryRule','filter','sortfield','countOutput','editable','excludeSearch','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['host','hostids','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

graphitem: {
    'get': {"type":"object","value":['gitemids','graphids','itemids','type','expandData','selectGraphs','sortfield','countOutput','editable','limit','output','preservekeys','sortorder']}
},

graphprototype: {
    'get': {"type":"object","value":['discoveryids','graphids','groupids','hostids','inherited','itemids','templated','templateids','selectDiscoveryRule','selectGraphItems','selectGroups','selectHosts','selectItems','selectTemplates','filter','sortfield','countOutput','editable','excludeSearch','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['host','hostids','name']},
    'delete': {"type":"array"}
},

history: {
    'get': {"type":"object","value":['history','hostids','itemids','time_from','time_till','sortfield','countOutput','editable','excludeSearch','filter','limit','output','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']}
},

host: {
    'get': {"type":"object","value":['groupids','applicationids','dserviceids','graphids','hostids','httptestids','interfaceids','itemids','maintenanceids','monitored_hosts','proxy_hosts','proxyids','templated_hosts','templateids','triggerids','with_items','with_applications','with_graphs','with_httptests','with_monitored_httptests','with_monitored_items','with_monitored_triggers','with_simple_graph_items','with_triggers','withInventory','selectGroups','selectApplications','selectDiscoveries','selectDiscoveryRule','selectGraphs','selectHostDiscovery','selectHttpTests','selectInterfaces','selectInventory','selectItems','selectMacros','selectParentTemplates','selectScreens','selectTriggers','filter','limitSelects','search','sortfield','countOutput','editable','excludeSearch','limit','output','preservekeys','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'exists': {"type":"object","value":['nodeids','hostid','host']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"},
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': []
},

hostgroup: {
    'get': {"type":"object","value":['nodeids','groupids','hostids','templateids','triggerids','graphids','proxyids','maintenanceids','monitored_hosts','templated_hosts','real_hosts','not_proxy_hosts','with_items','with_monitored_items','with_historucal_items','with_triggers','woth_monitored_triggers','with_httptests','with_monitored_httptests','with_graphs','editable','filter','search','startSearch','excludeSearch','output','select_templates','select_hosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','groupid','name']},
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': {"type":"array"}
},

image: {
    'get': {"type":"object","value":['nodeids','imageids','sysmapids','editable','filter','pattern','startPattern','excludePattern','output','select_image','countOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','imageid','name','imagetype']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

item: {
    'get': {"type":"object","value":['nodeids','groupids','hostids','templateids','proxyids','itemids','graphids','triggerids','applicationids','webitems','inherited','templated','monitored','editable','filter','group','host','application','belongs','with_triggers','search','startSearch','excludeSearch','output','select_hosts','select_triggers','select_graphs','select_applications','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','key_','hostid','host']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},
httptest: {
    'get': {"type":"object","value":['applicationids','groupids','hostids','httptestids','inherited','monitored','templated','templateids','expandName','expandStepName','selectHosts','selectSteps','sortfield','countOutput','editable','excludeSearch','filter','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

maintenance: {
    'get': {"type":"object","value":['nodeids','groupids','hostids','maintenanceids','editable','filter','pattern','startPattern','excludePattern','output','select_groups','select_hosts','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','maintenanceid','maintenance']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

map: {
    'get': {"type":"object","value":['nodeids','sysmapids','editable','filter','search','startSearch','excludeSearch','output','select_selements','select_links','countOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','sysmapid','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

mediatype: {
    'get': {"type":"object","value":['nodeids','userids','mediaids','mediatypeids','editable','filter','search','startSearch','excludeSearch','output','select_users','select_medias','countOutput','preservekeys','sortfield','sortorder','limit']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

proxy: {
    'get': {"type":"object","value":['nodeids','proxyids','editable','filter','search','startSearch','excludeSearch','output','select_hosts','countOutput','preservekeys','sortfield','sortorder','limit']},
    //'create': [],
    'delete': {"type":"array"}
},

screen: {
    'get': {"type":"object","value":['nodeids','screenids','screenitemids','type','editable','filter','search','startSearch','excludeSearch','output','select_screenitems','countOutput','preservekeys','sortfield','sortOrder','limit']},
    'exists': {"type":"object","value":['nodeids','screenid','name']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

script : {
    'get': {"type":"object","value":['nodeids','groupids','hostids','scriptids','editable','filter','search','startSearch','excludeSearch','output','select_groups','select_hosts','countOutput','preservekeys','sortfield','sortorder','limit']},
    'execute': {"type":"object","value":['scriptid','hostid']},
    //'create': [],
    //'update': [],
    'delete': {"type":"array"}
},

template: {
    'get': {"type":"object","value":['nodeids','groupids','templateids','parentTemplateids','hostids','itemids','triggerids','graphids','proxyids','maitenanceids','with_items','with_triggers','with_graphs','editable','filter','search','startSearch','excludeSrarch','output','select_groups','selectParentTemplates','select_templates','select_hosts','select_items','select_triggers','select_graphs','select_applications','select_macros','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','hostid','host']},
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': {"type":"array"}
},

trigger: {
    'get': {"type":"object","value":['triggerids','groupids','templateids','hostids','itemids','applicationids','functions','group','host','inherited','templated','monitored','active','maintenance','withUnacknowledgedEvents','withAcknowledgedEvents','withLastEventUnacknowledged','skipDependent','lastChangeSince','lastChangeTill','only_true','min_severity','expandComment','expandDescription','expandExpression','selectGroups','selectHosts','selectItems','selectFunctions','selectDependencies','selectDiscoveryRule','selectLastEvent','selectTags','filter','limitSelects','sortfield','countOutput','editable','excludeSearch','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'create': {"type":"object","value":["triggerid","description","expression",'comments','error','flags','lastchange','priority','state','status','templateid','type','url','value','recovery_mode','recovery_expression','correlation_mode','correlation_tag','manual_close','dependencies','tags']},
    'update': {"type":"object","value":["triggerid","description","expression",'comments','error','flags','lastchange','priority','state','status','templateid','type','url','value','recovery_mode','recovery_expression','correlation_mode','correlation_tag','manual_close','dependencies','tags']},
    'delete': {"type":"array"},
    'addDependencies': {"type":"object","value":['triggerid','dependsOnTriggerid']},
    'deleteDependencies': {"type":"object","value":['triggerids']}
},
triggerprototype:{
    'get':{"type":"object","value":['active','applicationids','discoveryids','functions','group','groupids','host','hostids','inherited','maintenance','min_severity','monitored','templated','templateids','triggerids','expandExpression','selectDiscoveryRule','selectFunctions','selectGroups','selectHosts','selectItems','selectDependencies','selectTags','filter','limitSelects','sortfield','countOutput','editable','excludeSearch','limit','output','preservekeys','search','searchByAny','searchWildcardsEnabled','sortorder','startSearch']},
    'create':{"type":"object","value":["triggerid","description ","expression","comments","priority","status","templateid","type","url","recovery_mode","recovery_expression","correlation_mode","correlation_tag","manual_close","dependencies","tags"]},
    'update':{"type":"object","value":["triggerid","description ","expression","comments","priority","status","templateid","type","url","recovery_mode","recovery_expression","correlation_mode","correlation_tag","manual_close","dependencies","tags"]},
    'delete':{"type":"array"}
},

user: {
    'get': {"type":"object","value":['nodeids','usrgrpids','userids','mediaids','mediatypeids','editable','filter','search','startSearch','excludeSearch','output','select_usrgrps','select_medias','select_mediatypes','get_graphs','countOutput','groupOutput','preservekeys','sortfield','sortorder','limit']},
    //'create': [],
    //'update': [],
    //'updateProfile': [],
    'delete': {"type":"array"},
    //'addMedia': [],
    //'updateMedia': [],
    //'deleteMedia': [],
    'authenticate': {"type":"object","value":[]},
    'login': {"type":"object","value":['user','password']},
    'logout': {"type":"object","value":[]}
},

usergroup: {
    'get': {"type":"object","value":['nodeids','usrgrpids','userids','status','with_gui_access','with_api_access','editable','filter','pattern','startPattern','excludePattern','select_users','output','countOutput','preservekeys','sortfield','sortorder','limit']},
    'exists': {"type":"object","value":['nodeids','usrgrpid','name']},
    //'create': [],
    //'update': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'delete': {"type":"array"}
},

usermacro: {
    'get': {"type":"object","value":['nodeids','groupids','hostids','templateids','hostmacroids','globalmacroids','globalmacro','editable','filter','pattern','startPattern','excludePattern','output','select_groups','select_hosts','select_templates','countOutput','preservekeys','sortfield','sortorder','limit']},
    //'createGlobal': [],
    //'updateGlobal': [],
    //'massAdd': [],
    //'massUpdate': [],
    //'massRemove': [],
    'deleteGlobal': {"type":"object","value":['grobalmacroids']},
    'deleteHostMacro': {"type":"object","value":['hostmacroids']}
}
// end parameters
};
