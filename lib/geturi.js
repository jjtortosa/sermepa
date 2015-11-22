/* global module */
var http = require('http')
,	https = require('https');

module.exports = function urlContent(url, cb){
	var p = url.match(/^https/) ? https : http;
	
	p.get(url, function(response){
		var body = '';
		response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
			cb(null, body);
        });
	}).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        cb(err);
    });
};