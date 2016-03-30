"use strict";

const Sermepa = require('../lib/api');
const uris = {
	real: 'https://sis.redsys.es/sis/realizarPago',
	test: 'https://sis-t.redsys.es:25443/sis/realizarPago'
};

module.exports = function(req, res) {
	const f = req.query;
	const uri = uris[f.mode];
	const comercio = f.comercio || '327234688';
	const clave = f.clave || 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
	const obj = new Sermepa({
		Ds_Merchant_Amount: 145,
		Ds_Merchant_Currency: 978,
		Ds_Merchant_Order: Date.now().toFixed().substr(5),
		Ds_Merchant_MerchantCode: comercio,
		Ds_Merchant_MerchantURL: '',
		Ds_Merchant_UrlOK: '',
		Ds_Merchant_UrlKO: '',
		Ds_Merchant_Terminal: 1,
		Ds_Merchant_TransactionType: 0
	});

	const params = obj.createFormParameters(clave);

	res.render('genpet', {
		uri: uri,
		params: JSON.stringify(obj.params, null, '\t'),
		fparams: params
	});
	
};