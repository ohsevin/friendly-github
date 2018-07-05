import 'webext-dynamic-content-scripts';
import {h} from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';

import addReactionParticipants from './features/reactions-avatars';
import showRealNames from './features/show-names';
import showStargazersYouKnow from './features/show-stargazers-you-know';
import showFollowersYouKnow from './features/show-followers-you-know';
import suggestSimilarUsers from './features/suggest-similar-users';

import * as pageDetect from './libs/page-detect';
import {safeElementReady, enableFeature, safeOnAjaxedPages, injectCustomCSS} from './libs/utils';

// Add globals for easier debugging
window.select = select;

async function init() {
	await safeElementReady('body');

	if (pageDetect.is404() || pageDetect.is500()) {
		return;
	}

	if (document.body.classList.contains('logged-out')) {
		console.warn('%cFriendly GitHub%c only works when you’re logged in to GitHub.', 'font-weight: bold', '');
		return;
	}

	if (select.exists('html.friendly-github')) {
		console.warn('Friendly GitHub has been loaded twice. If you didn’t install the developer version, this may be a bug. Please report it to: https://github.com/hermanya/friendly-github/issues');
		return;
	}

	document.documentElement.classList.add('friendly-github');

	injectCustomCSS();

	await domLoaded;
	onDomReady();
}

async function onDomReady() {
	// Push safeOnAjaxedPages on the next tick so it happens in the correct order
	// (specifically for addOpenAllNotificationsButton)
	await Promise.resolve();

	safeOnAjaxedPages(() => {
		ajaxedPagesHandler();

		// Mark current page as "done"
		// so history.back() won't reapply the same changes
		const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
		if (ajaxContainer) {
			ajaxContainer.append(<has-friendly-gh/>);
		}
	});
}

// eslint-disable-next-line complexity
function ajaxedPagesHandler() {
	if (pageDetect.isRepo()) {
		enableFeature(showStargazersYouKnow);
	}

	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit() || pageDetect.isDiscussion()) {
		enableFeature(addReactionParticipants);
		enableFeature(showRealNames);
	}

	if (pageDetect.isUserProfile()) {
		enableFeature(showFollowersYouKnow);
		enableFeature(suggestSimilarUsers);
	}
}

init();
