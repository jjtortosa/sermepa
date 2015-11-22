function Sermepa(params){
	this.params = params || {};
}

Sermepa.prototype.set = function(key, value){
	this.params[key] = value;
};

Sermepa.prototype.get = function(key){
	return this.params[key];
};

Sermepa.prototype.get = function(key){
	return this.params[key];
};

Sermepa.prototype.getOrder = function(){
	return this.params['Ds_Merchant_Order'] || this.params['DS_MERCHANT_ORDER'];
};

Sermepa.prototype.getOrderNotif = function(){
	return this.params['Ds_Order'] || this.params['DS_ORDER'];
};

Sermepa.prototype.createFormParameters = function(key, cb){
	var params = base64encode(JSON.stringify(this.params));
	
	this._phpSig(params, key, this.getOrder(), function(err, sig){
		if(err)
			return cb(err);
		
		cb(null, {
			Ds_SignatureVersion: "HMAC_SHA256_V1",
			Ds_MerchantParameters: params,
			Ds_Signature: sig
		});
	});
};

Sermepa.processResponse = function(key, response, cb){
	var datos = response.Ds_MerchantParameters;
	
	if(!datos)
		return next(new Error('no Ds_MerchantParameters'));
	
	var params = JSON.parse(base64decode(datos));

	params.Ds_Date = decodeURIComponent(params.Ds_Date);
	params.Ds_Hour = decodeURIComponent(params.Ds_Hour);
	
	var obj = new Sermepa(params);
	
	obj.createMerchantSignatureNotif(key, datos, function(err, sig){
		if(err)
			return cb(err);

		if(sig !== response.Ds_Signature)
			return cb(new Error("FIRMA KO"), params, obj);
		
		cb(null, params, obj);
	});
};

Sermepa.prototype.createMerchantSignatureNotif = function(key, datos, cb){
	this._phpSig(datos, key, this.getOrderNotif(), function(err, sig){
		if(err)
			return cb(err);
		
		return cb(null, sig.replace(/\+/g, '-').replace(/\//g, '_'));
	});
};

Sermepa.prototype._phpSig = function(datos, key, order, cb){
	var runner = require("child_process");
	
	runner.exec("php " + __dirname + "/encoder.php" + " " +datos + " " + key  + " " + order  + " " , function(err, r) {
		if(err)
			return cb(err);
		
		r = JSON.parse(r);
		
		cb(null, r.sig);
	});
};


//helpers

function base64encode(str){
	return new Buffer(str).toString('base64');
}

function base64decode(str){
	return new Buffer(str, 'base64').toString();
}

function base64UrlEncode(str){
	return base64encode(str).replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str){
	return base64decode(str).replace(/\-/g, '+').replace(/_/g, '/');
}

function encrypt3DES(msg, key, cb){
	var g = require('../modules/utils').urlContent;

	g('http://eucalipthus.net/des3.php?s=' + key + '&m=' + msg, cb);
}

function _test_encrypt3DES(msg, key){
	var des_iv = "\000\000\000\000\000\000\000\000";
	var des3_encryption = crypto.createCipheriv("des", key, des_iv);
	var ciphered_string = des3_encryption.update(msg, "utf8", "base64");
	console.log(msg+" "+ciphered_string);
}

function mac256(ent, key){
	return crypto.createHmac('sha256', key).update(ent).digest('hex');
}

module.exports = Sermepa;