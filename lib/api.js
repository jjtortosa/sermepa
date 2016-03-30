"use strict";

const crypto = require('crypto');
const debug = require('debug')('sermepa:api');

debug.log = console.log.bind(console);

class Sermepa {
	constructor(params) {
		this.params = params || {};
	}

	//noinspection JSUnusedGlobalSymbols
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

	createFormParameters(key) {
		const merchantParams = Sermepa.base64encode(JSON.stringify(this.params));
		return {
			Ds_SignatureVersion: "HMAC_SHA256_V1",
			Ds_MerchantParameters: merchantParams,
			Ds_Signature: Sermepa.encode(merchantParams, key, this.getOrder())
		};
	}

	//noinspection JSUnusedGlobalSymbols
	static processResponse(key, response) {
		const data = response.Ds_MerchantParameters;

		if (!data)
			return {error: new Error('no Ds_MerchantParameters')};

		var params = JSON.parse(Sermepa.base64decode(data));

		params.Ds_Date = decodeURIComponent(params.Ds_Date);
		params.Ds_Hour = decodeURIComponent(params.Ds_Hour);

		const obj = new Sermepa(params);
		const ret = {params: params, obj: obj};
		const sig = obj.createMerchantSignatureNotif(key, data);
		
		if (sig !== response.Ds_Signature)
			ret.error = new Error("FIRMA KO");

		return ret;
	}

	createMerchantSignatureNotif(key, data) {
		let sig = Sermepa.encode(data, key, this.getOrderNotif());

		return sig.replace(/\+/g, '-').replace(/\//g, '_');
	}

	static encode(data, key, order) {
		const k = Sermepa.encrypt3DES(order, key);
		return Sermepa.mac256(data, k);
	}

	static encrypt3DES (str,key) {
		const secretKey = new Buffer(key, 'base64');
		const iv = new Buffer(8);
		iv.fill(0);
		const cipher = crypto.createCipheriv('des-ede3-cbc', secretKey, iv);
		cipher.setAutoPadding(false);

		return cipher.update(Sermepa.zeroPad(str, 8), 'utf8', 'base64') + cipher.final('base64');
	}

	static mac256(data, key) {
		const hexMac256 = crypto.createHmac("sha256", new Buffer(key, 'base64')).update(data).digest("hex");
		return new Buffer(hexMac256, 'hex').toString('base64');
	}
	
	static base64encode(str){
		return new Buffer(str).toString('base64');
	}
	
	static base64decode(str){
		return new Buffer(str, 'base64').toString();
	}
	
	static zeroPad(str, blocksize) {
		const buf = new Buffer(str, "utf8");
		const pad = new Buffer((blocksize - (buf.length % blocksize)) % blocksize);

		pad.fill(0);

		return Buffer.concat([buf, pad]);
	}
}


module.exports = Sermepa;