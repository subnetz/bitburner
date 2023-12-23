import { NS } from '../..';
import { doc } from '/lib/html';

let player, dealer, hitButton, stayButton;
export async function main(ns: NS) {
	ns.tail();
	let playerAndDealer = doc.querySelectorAll(
		'.MuiPaper-root.MuiPaper-elevation2'
	);
	if (playerAndDealer.length != 2) {
		ns.print(`ERROR Could not find node "playerAndDealer"`);
		return;
	}
	player = playerAndDealer[0];
	dealer = playerAndDealer[1];
	hitButton = Array.from(
		doc.querySelectorAll('button.MuiButton-textPrimary')
	).find((btn) => btn.textContent == 'Hit');
	stayButton = Array.from(
		doc.querySelectorAll('button.MuiButton-textSecondary')
	).find((btn) => btn.textContent == 'Stay');

	if (player.querySelector('p')?.textContent != 'Player') {
		ns.print(`ERROR Could not find node "Player"`);
		return;
	}
	if (dealer.querySelector('p')?.textContent != 'Dealer') {
		ns.print(`ERROR Could not find node "Dealer"`);
		return;
	}
	if (!hitButton) {
		ns.print(`ERROR Could not find node "hitButton"`);
		return;
	}
	if (!stayButton) {
		ns.print(`ERROR Could not find node "stayButton"`);
		return;
	}

	playBlackjack(ns);
}

function playBlackjack(ns: NS) {
	let pcount = Number(
		player.lastElementChild.textContent.replace('Count: ', '')
	);
	let dcount = Number(
		dealer.childNodes[1].textContent
			.replace(/[♥♦♣♠]/g, '')
			.replace(/[JKQ]/g, '10')
			.replace(/[A]/g, '11')
	);
	if (pcount >= 17) {
		stayButton.click();
	} else if (dcount >= 7) {
		hitButton.click();
	} else if (pcount >= 13) {
		stayButton.click();
	} else if (pcount == 12) {
		if (dcount >= 4 && dcount <= 6) {
			stayButton.click();
		} else {
			hitButton.click();
		}
	} else {
		hitButton.click();
	}
}
