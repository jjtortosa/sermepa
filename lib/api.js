"use strict";

const debug = require('debug')('sermepa:api');
const runner = require("child_process");

debug.log = console.log.bind(console);

class Sermepa {
	constructor(params) {
		this.params = params || {};
	}

	set(key, value) {
		this.params[key] = value;
	}

	get(key) {
		return this.params[key];
	}

	getOrder() {
		return (this.params['Ds_Merchant_Order'] || this.params['DS_MERCHANT_ORDER'] || '').trim();
	}

	getOrderNotif() {
		return (this.params['Ds_Order'] || this.params['DS_ORDER'] || '').trim();
	}

	createFormParameters(key, cb) {
		var params = base64encode(JSON.stringify(this.params));

		this._phpSig(params, key, this.getOrder(), function (err, sig) {
			if (err)
				return cb(err);

			cb(null, {
				Ds_SignatureVersion: "HMAC_SHA256_V1",
				Ds_MerchantParameters: params,
				Ds_Signature: sig
			});
		});
	}

	static processResponse(key, response, cb) {
		var datos = response.Ds_MerchantParameters;

		if (!datos)
			return cb(new Error('no Ds_MerchantParameters'));

		var params = JSON.parse(base64decode(datos));

		params.Ds_Date = decodeURIComponent(params.Ds_Date);
		params.Ds_Hour = decodeURIComponent(params.Ds_Hour);

		var obj = new Sermepa(params);

		obj.createMerchantSignatureNotif(key, datos, function (err, sig) {
			if (err)
				return cb(err);

			if (sig !== response.Ds_Signature)
				return cb(new Error("FIRMA KO"), params, obj);

			cb(null, params, obj);
		});
	}

	createMerchantSignatureNotif(key, datos, cb) {
		this._phpSig(datos, key, this.getOrderNotif(), function (err, sig) {
			if (err)
				return cb(err);

			return cb(null, sig.replace(/\+/g, '-').replace(/\//g, '_'));
		});
	}

	_phpSig(datos, key, order, cb) {
		const cmd = "php " + __dirname + "/encoder.php" + " " + datos + " " + key + " " + order;

		debug(cmd);

		runner.exec(cmd, function (err, r) {
			if (err)
				return cb(err);

			r = JSON.parse(r);

			cb(null, r.sig);
		});
	}
}


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

function mac256(ent, key){
	return crypto.createHmac('sha256', key).update(ent).digest('hex');
}

module.exports = Sermepa;