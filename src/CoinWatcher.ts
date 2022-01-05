import axios from 'axios';
import { urls } from './utils/urls.js';
import { cts } from './utils/constants.js';
import { Watcher } from './Watcher.js';

interface ICoins {
	BNB: number;
	THC: number;
}
type Coin = keyof ICoins;

class CoinWatcher extends Watcher {
	public coins: ICoins;
	constructor(fetchIntervalMs: number = cts.FETCH_COINS_INTERVAL) {
		super(fetchIntervalMs);
		this.coins = {
			BNB: 0,
			THC: 0,
		};
	}

	private async fetchCoin(coin: Coin): Promise<number> {
		try {
			const req = await axios({
				url: urls[`GET_${coin}_PRICE`],
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'accept-language': 'en-US,en;q=0.9',
					'cache-control': 'max-age=0',
					'content-type': 'application/json',
					'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Linux"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-site',
					Referer: 'https://marketplace.thetanarena.com/',
					'Referrer-Policy': 'strict-origin-when-cross-origin',
				},
				data: null,
			});
			if (req.status !== 200) {
				throw new Error(`Network error: ${req.status}`);
			}
			if (!req.data.success) {
				throw new Error(`API error: ${req.data.code} - ${req.data.status}`);
			}
			if (!req.data.data) {
				throw new Error(`API error: no price returned`);
			}

			return req.data.data;
		} catch (e: any) {
			console.error(`Error fetching ${coin} price. ${e}`);
			return 0;
		}
	}

	protected async fetchData(): Promise<void> {
		for (const coin of ['BNB', 'THC']) {
			this.coins[coin as Coin] = await this.fetchCoin(coin as Coin);
		}
	}
}

export { CoinWatcher };

/* Old  way to get with puppeteer */
/*
const FETCH_THC = 'https://poocoin.app/tokens/0x24802247bd157d771b7effa205237d8e9269ba8a';
const FETCH_BNB = 'https://poocoin.app/tokens/bnb';
const FETCH_COINS_INTERVAL = 45000;

async function coinPricesRoutine() {
	async function getCoinsPrice() {
		const browser = await puppeteer.launch();
		const [page] = await browser.pages();
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
		);

		// Get THC price
		await page.goto(FETCH_THC);
		await page.waitForXPath(`.//*[contains(text(), 'Thetan Coin price chart')]`);
		const titleTHC = await page.title();
		let thcPrice: number = parseFloat(titleTHC.split('$')[1]);
		if (!thcPrice) thcPrice = 0;
		console.log('UPDATE: THC price: ' + thcPrice);

		// Get BNB price
		await page.goto(FETCH_BNB);
		await page.waitForXPath(`.//*[contains(text(), 'Wrapped BNB price chart')]`);
		const titleBNB = await page.title();
		let bnbPrice: any = parseFloat(titleBNB.split('$')[1]);
		if (!bnbPrice) bnbPrice = 0;
		console.log('UPDATE: BNB price: ' + bnbPrice);

		await page.close();
		await browser.close();
		return [thcPrice, bnbPrice];
	}

	setAsyncInterval(async () => {
		[thcPriceDollar, bnbPriceDollar] = await getCoinsPrice();
	}, FETCH_COINS_INTERVAL);
}
*/