import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';
import {getLoggedInUsername, getProfileUsername} from '../libs/utils';
import api from '../libs/api';

const renderBadge = message => (
	<span title={`Label: ${message}`} className="Label Label--gray ml-2">{message}</span>
);

export default async () => {
	if (getCleanPathname().startsWith(getLoggedInUsername())) {
		return;
	}
	const container = select('[itemtype="http://schema.org/Person"]');
	if (!container) {
		return;
	}
	const endpoint = `users/${getProfileUsername()}/following/${getLoggedInUsername()}`;
	const response = await api(endpoint);
	if (response === 'No Content') {
		// Response if user follows target user
		// Status: 204 No Content
		container.querySelector('.vcard-username').append(renderBadge('Follows you'));
	}
};
