/*jslint node: true */
var request = require('request');
var apigee = require('../config.js');
var proxies;
module.exports = function(grunt) {
	'use strict';
	grunt.registerTask('importRoles', 'Import all custom roles from org ' + apigee.from.org + " [" + apigee.from.version + "]", function() {
		var url = apigee.from.url;
		var org = apigee.from.org;
		var userid = apigee.from.userid;
		var passwd = apigee.from.passwd;
		var fs = require('fs');
		var filepath = grunt.config.get("exportRoles.dest.data");
		var done_count =0;
		var done = this.async();
		var files;
		var done_count = 0;
		url = url + "/v1/organizations/" + org + "/userroles";
		var fs = require('fs');
		var opts = {flatten: false};
		var f = grunt.option('src');
		if (f)
		{
			grunt.verbose.writeln('src pattern = ' + f);
			files = grunt.file.expand(opts,f);
		}
		else
		{
			files = this.filesSrc;
		}
		var total_count = 0;
		var proxyMap = new Map();
		files.forEach(function(filepath) {
			var rolePath = filepath.split('/');
			var roleName = proxy_array[3];
			proxyMap.set(roleName, []);
			console.log(roleName);
		});/*
		files.forEach(function(filepath) {
			var proxy_array = filepath.split('/');
			proxyMap.get(proxy_array[3]).push(filepath);
			console.log(proxy_array[3]);
			total_count++;
		});*/
	});
	grunt.registerTask('exportRoles', 'Export all custom roles from org ' + apigee.from.org + " [" + apigee.from.version + "]", function() {
		var url = apigee.from.url;
		var org = apigee.from.org;
		var userid = apigee.from.userid;
		var passwd = apigee.from.passwd;
		var fs = require('fs');
		var filepath = grunt.config.get("exportRoles.dest.data");
		var done_count =0;
		var done = this.async();
		grunt.verbose.write("getting roles..." + url);
		grunt.file.mkdir(filepath);
		url = url + "/v1/organizations/" + org + "/userroles/";
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var existingRoles =  JSON.parse(body);
				existingRoles.forEach(function(roleName) {
					grunt.verbose.writeln ("\nFetching role: " + roleName);
					if(roleName !== 'user' && 
					roleName !== 'devadmin' && 
					roleName !== 'opsadmin' && 
					roleName !== 'orgadmin'&& 
					roleName !== 'businessuser'&& 
					roleName !== 'readonlyadmin'){
						grunt.verbose.writeln ("\Writing role: " + roleName);
						request({url: url+'/'+roleName}).auth(userid, passwd, true)
						.pipe(fs.createWriteStream(filepath + '/' + roleName +'.json'))
						.on('close', function () {
							done_count++;
							if (done_count == existingRoles.length)
							{
								grunt.log.ok('Exported ' + done_count + ' roles.');
								done();
							}
							//grunt.verbose.writeln('Proxy File written!');
						});
					}
				});
			}
		}).auth(userid, passwd, true);
	});
	grunt.registerTask('exportProxies', 'Export all proxies from org ' + apigee.from.org + " [" + apigee.from.version + "]", function() {
		var url = apigee.from.url;
		var org = apigee.from.org;
		var userid = apigee.from.userid;
		var passwd = apigee.from.passwd;
		var fs = require('fs');
		var filepath = grunt.config.get("exportProxies.dest.data");
		var done_count =0;
		var done = this.async();
        // var done = this.async();
		grunt.verbose.write("getting proxies..." + url);
		url = url + "/v1/organizations/" + org + "/apis";

		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			    proxies =  JSON.parse(body);
			   
			    for (var i = 0; i < proxies.length; i++) {
			    	var proxy_url = url + "/" + proxies[i];
			    	grunt.file.mkdir(filepath);

			    	//Call proxy details
					request(proxy_url, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							grunt.verbose.write(body);
						    var proxy_detail =  JSON.parse(body);
                            // var proxy_file = filepath + "/" + proxy_detail.name;
						    // gets max revision - May not be the deployed version
						    //var max_rev = proxy_detail.revision[proxy_detail.revision.length -1];
							
							for(var init = proxy_detail.revision.length-1; init > -1; init--){
									var max_rev = proxy_detail.revision[init];
									var proxy_download_url = url + "/" + proxy_detail.name + "/revisions/" + max_rev + "?format=bundle";
									grunt.verbose.writeln ("\nFetching proxy bundle  : " + proxy_download_url);

									grunt.file.mkdir(filepath + "/" + proxy_detail.name + '/');
									
									request(proxy_download_url).auth(userid, passwd, true)
									  .pipe(fs.createWriteStream(filepath + "/" + proxy_detail.name + '/' + max_rev +'.zip'))
									  .on('close', function () {
										//grunt.verbose.writeln('Proxy File written!');
									});
							}
						}
						else
						{
							grunt.log.error(error);
						}
						done_count++;
						if (done_count == proxies.length)
						{
							grunt.log.ok('Exported ' + done_count + ' proxies.');
							done();
						}
					}).auth(userid, passwd, true);
			    	// End proxy details
			    }; 			    
			} 
			else
			{
				grunt.log.error(error);
			}
		}).auth(userid, passwd, true);
	});

	grunt.registerMultiTask('importProxies', 'Import all proxies to org ' + apigee.to.org + " [" + apigee.to.version + "]", function() {
		var url = apigee.to.url;
		var org = apigee.to.org;
		var userid = apigee.to.userid;
		var passwd = apigee.to.passwd;
		var files;
		var done_count = 0;
		url = url + "/v1/organizations/" + org + "/apis?action=import&name=";
		var fs = require('fs');
		var opts = {flatten: false};
		var f = grunt.option('src');
		if (f)
		{
			grunt.verbose.writeln('src pattern = ' + f);
			files = grunt.file.expand(opts,f);
		}
		else
		{
			files = this.filesSrc;
		}
		var total_count = 0;
		var proxyMap = new Map();
		files.forEach(function(filepath) {
			var proxy_array = filepath.split('/');
			var proxy_name = proxy_array[3];
			proxyMap.set(proxy_name, []);
		});
		files.forEach(function(filepath) {
			var proxy_array = filepath.split('/');
			proxyMap.get(proxy_array[3]).push(filepath);
			console.log(proxy_array[3]);
			total_count++;
		});
		var separateReqPool = {maxSockets: 1};
		proxyMap.forEach(function(value, key) {
		  console.log(key);
			  var mapInt = new Map();
			  var intSorted = [];
			  for(var f = 0; f < proxyMap.get(key).length; f++){
				  var revNo = parseInt(proxyMap.get(key)[f].split('/')[4].split('.')[0]);
				  mapInt.set(revNo, proxyMap.get(key)[f]);
				  intSorted.push(revNo);
			  }
			  intSorted.sort(function(a, b){return a-b});
			  for(var f = 0; f < intSorted.length; f++){
				  
				  var revReq = request.post({url: url+key, timeout: 10000, pool: separateReqPool}, function (err, resp, body) {
					  if (err) {
						grunt.log.error(err);
					  } else {
						grunt.verbose.writeln('Resp [' + resp.statusCode + '] for proxy revision creation ' + this.url + ' -> ' + body);
					  }
					  done_count++;
						if (done_count == total_count)
						{
							grunt.log.ok('Exported ' + done_count + ' proxies.');
							done();
						}
				  }.bind( {url: url+key, timeout: 10000, pool: separateReqPool})).auth(userid, passwd, true);
				  var form_1 = revReq.form();
				  console.log(mapInt.get(intSorted[f]));
				  form_1.append('file', fs.createReadStream(mapInt.get(intSorted[f])));
			  }
		});
		var done = this.async();
	});

	grunt.registerMultiTask('deleteProxies', 'Delete all proxies from org ' + apigee.to.org + " [" + apigee.to.version + "]", function() {
		var url = apigee.to.url;
		var org = apigee.to.org;
		var userid = apigee.to.userid;
		var passwd = apigee.to.passwd;
		var done_count =0;
		var files;
		url = url + "/v1/organizations/" + org + "/apis/";
		var done = this.async();
		var opts = {flatten: false};
		var f = grunt.option('src');
		if (f)
		{
			grunt.verbose.writeln('src pattern = ' + f);
			files = grunt.file.expand(opts,f);
		}
		else
		{
			files = this.filesSrc;
		}
		var done = this.async();
		files.forEach(function(filepath) {
			grunt.verbose.writeln("processing file " + filepath);
			var folders = filepath.split("/");
			var proxy_file = folders[folders.length - 1];
			var proxy = proxy_file.split(".")[0];
			var app_del_url = url + proxy;
			grunt.verbose.writeln(app_del_url);
			request.del(app_del_url,function(error, response, body){
			  grunt.verbose.writeln('Resp [' + response.statusCode + '] for proxy deletion ' + this.app_del_url + ' -> ' + body);
			  if (error || response.statusCode!=200)
			  	grunt.verbose.error('ERROR Resp [' + response.statusCode + '] for proxy deletion ' + this.app_del_url + ' -> ' + body); 
			  done_count++;
			  	if (done_count == files.length)
				{
					grunt.log.ok('Processed ' + done_count + ' proxies');
					done();
				}
			}.bind( {app_del_url: app_del_url}) ).auth(userid, passwd, true);	
		});
	});


	grunt.registerTask('deployProxies', 'Deploy revision 1 on all proxies for org ' + apigee.to.org + " [" + apigee.to.version + "]", function() {
			var url = apigee.to.url;
			var org = apigee.to.org;
			var env = apigee.to.env;
			var userid = apigee.to.userid;
			var passwd = apigee.to.passwd;
			var done_count =0;
			var done = this.async();
			url = url + "/v1/organizations/" + org ;
			var proxies_url = url +  "/apis" ;

			request(proxies_url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					//grunt.log.write(body);
				    proxies =  JSON.parse(body);
				   
				    for (var i = 0; i < proxies.length; i++) {
				    	var proxy_url = url + "/environments/" + env + "/apis/" + proxies[i] + "/revisions/1/deployments";
				    	grunt.verbose.writeln(proxy_url);
				    	//Call proxy deploy
						request.post(proxy_url, function (error, response, body) {
							if (!error && response.statusCode == 200) {
								grunt.verbose.writeln('Resp [' + response.statusCode + '] for proxy deployment ' + this.proxy_url + ' -> ' + body);
							}
							else
							{
								grunt.log.error('ERROR Resp [' + response.statusCode + '] for proxy deployment ' + this.proxy_url + ' -> ' + body);
							}
							done_count++;
						  	if (done_count == proxies.length)
							{
								grunt.log.ok('Processed ' + done_count + ' proxies');
								done();
							}
						}).auth(userid, passwd, true);
				    	// End proxy deploy
				    }; 
				    
				} 
				else
				{
					grunt.log.error(error);
				}
			}.bind( {proxy_url: proxy_url}) ).auth(userid, passwd, true);
	});

	grunt.registerTask('undeployProxies', 'UnDeploy revision 1 on all proxies for org ' + apigee.to.org + " [" + apigee.to.version + "]", function() {
			var url = apigee.to.url;
			var org = apigee.to.org;
			var env = apigee.to.env;
			var userid = apigee.to.userid;
			var passwd = apigee.to.passwd;
			var done_count =0;
			var done = this.async();
			url = url + "/v1/organizations/" + org ;
			var proxies_url = url +  "/apis" ;

			request(proxies_url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					//grunt.log.write(body);
				    proxies =  JSON.parse(body);
				   
				    for (var i = 0; i < proxies.length; i++) {
				    	var proxy_url = url + "/environments/" + env + "/apis/" + proxies[i] + "/revisions/1/deployments";
				    	grunt.verbose.writeln(proxy_url);
				    	//Call proxy undeploy
						request.del(proxy_url, function (error, response, body) {
							if (!error && response.statusCode == 200) {
								grunt.verbose.writeln(body);
							}
							else
							{
								grunt.log.error(error);
							}
							done_count++;
						  	if (done_count == proxies.length)
							{
								grunt.log.ok('Processed ' + done_count + ' proxies');
								done();
							}
						}).auth(userid, passwd, true);
				    	// End proxy undeploy
				    }; 
				    
				} 
				else
				{
					grunt.log.error(error);
				}
			}).auth(userid, passwd, true);
	});

};
