var Sermepa = require('../lib/api');

var uris = {
	real: 'https://sis.redsys.es/sis/realizarPago',
	test: 'https://sis-t.redsys.es:25443/sis/realizarPago'
};

module.exports = function(req, res, next) {
	var f = req.query
	,	uri = uris[f.mode]
	,	comercio = f.comercio || '327234688'
	,	clave = f.clave || 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
	
	var obj = new Sermepa({
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

	obj.createFormParameters(clave, function(err, fparams){
		if(err)
			return next(err);
		
		res.render('genpet', {
			uri: uri,
			params: JSON.stringify(obj.params, null, '\t'),
			fparams: fparams
		});
	});
	
};