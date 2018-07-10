import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import domify from '../libs/domify';
import {getCleanPathname} from '../libs/page-detect';

const rerenderUserCard = card => {
	card.style.width = '100%';
	card.classList.remove('border-bottom');
	card.classList.add('m-0');
	const mediaBody = card.querySelector('.follower-list-align-top.d-inline-block.ml-3');
	mediaBody.classList.remove('ml-3');
	mediaBody.prepend(mediaBody.querySelector('.user-following-container'));
	const avatar = card.querySelector('.avatar');
	avatar.setAttribute('width', 28);
	avatar.setAttribute('height', 28);
	mediaBody.prepend(avatar);
	return card;
};

const getSuggestedUserCards = async () => {
	const url = `${location.origin}/${getCleanPathname()}/following`;
	const response = await fetch(url, {credentials: 'same-origin'});
	const dom = domify(await response.text());
	const allUserCards = [...dom.querySelectorAll('.follow-list-item')];
	const suggestedUserCards = allUserCards.filter(card => {
		const follow = card.querySelector('.user-following-container');
		return follow && !follow.classList.contains('on');
	});
	return suggestedUserCards;
};

let runOnce = false;
export default function () {
	delegate('[aria-label="Follow this person"]', 'click', async () => {
		if (runOnce) {
			return;
		}
		runOnce = true;
		const followButtonContainer = select('.user-profile-following-container');
		if (!followButtonContainer) {
			return;
		}
		const userCards = await getSuggestedUserCards();
		if (userCards.length === 0) {
			return;
		}
		followButtonContainer.parentNode.insertBefore(<div>
			<h2 class="mb-1 h4">Suggested</h2>
			<ol class="follow-list clearfix">
				{userCards.slice(0, 4).map(rerenderUserCard)}
			</ol>
		</div>, followButtonContainer.nextElementSibling);
	});
}
