const request = require('request-promise');

const reptileTargetUrl = async (url) =>
	request({
		url,
		method: 'GET',
		encoding: null,
	});

module.exports = { reptileTargetUrl };
