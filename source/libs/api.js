import OptionsSync from 'webext-options-sync';

const cache = new Map();

export default async endpoint => {
	if (cache.has(endpoint)) {
		return cache.get(endpoint);
	}
	const headers = {
		'User-Agent': 'Friendly GitHub',
		Accept: 'application/vnd.github.v3+json'
	};
	const {personalToken} = await new OptionsSync().getAll();
	if (personalToken) {
		headers.Authorization = `token ${personalToken}`;
	}
	const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;
	const response = await fetch(api + endpoint, {headers});
	let json;
	try {
		json = await response.json();
	} catch (e) {
		json = response.statusText;
	}
	if (response.ok) {
		cache.set(endpoint, json);
	} else if (json.message.includes('API rate limit exceeded')) {
		console.error(
			'Friendly GitHub hit GitHub API’s rate limit. Set your token in the options or take a walk! 🍃 🌞'
		);
	} else if (json.message === 'Bad credentials') {
		console.error(
			'Friendly GitHub couldn’t use GitHub’s API because the token seems to be incorrect or expired. Update it in the options.'
		);
	} else {
		console.warn(
			'Friendly GitHub got a negative response from GitHub’s API. This may be the expected behaviour for requests with No Content.',
			personalToken ? 'If you believe it is not expected, ensure that your token is properly configured.' :
				'Maybe adding a token in the options will fix this issue.',
			'\n',
			JSON.stringify(json, null, '\t')
		);
	}
	return json;
};
