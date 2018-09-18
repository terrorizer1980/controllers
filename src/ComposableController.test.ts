import { stub } from 'sinon';
import AddressBookController from './AddressBookController';
import ComposableController from './ComposableController';
import PreferencesController from './PreferencesController';
import TokenRatesController from './TokenRatesController';
import { AssetsController } from './AssetsController';
import { NetworkController } from './NetworkController';

describe('ComposableController', () => {
	it('should compose controller state', () => {
		const controller = new ComposableController([
			new AddressBookController(),
			new AssetsController(),
			new NetworkController(),
			new PreferencesController(),
			new TokenRatesController()
		]);
		expect(controller.state).toEqual({
			AddressBookController: { addressBook: [] },
			AssetsController: { allTokens: {}, allCollectibles: {}, collectibles: [], tokens: [] },
			NetworkController: {
				network: 'loading',
				provider: { type: 'rinkeby' }
			},
			PreferencesController: {
				featureFlags: {},
				identities: {},
				lostIdentities: {},
				selectedAddress: ''
			},
			TokenRatesController: { contractExchangeRates: {} }
		});
	});

	it('should compose flat controller state', () => {
		const controller = new ComposableController([
			new AddressBookController(),
			new AssetsController(),
			new NetworkController(),
			new PreferencesController(),
			new TokenRatesController()
		]);
		expect(controller.flatState).toEqual({
			addressBook: [],
			allCollectibles: {},
			allTokens: {},
			collectibles: [],
			contractExchangeRates: {},
			featureFlags: {},
			identities: {},
			lostIdentities: {},
			network: 'loading',
			provider: { type: 'rinkeby' },
			selectedAddress: '',
			tokens: []
		});
	});

	it('should expose sibling context', () => {
		const controller = new ComposableController([
			new AddressBookController(),
			new AssetsController(),
			new NetworkController(),
			new PreferencesController(),
			new TokenRatesController()
		]);
		const addressContext = controller.context.TokenRatesController.context
			.AddressBookController as AddressBookController;
		expect(addressContext).toBeDefined();
		addressContext.set('1337', 'foo');
		expect(controller.flatState).toEqual({
			addressBook: [{ address: '1337', name: 'foo' }],
			allCollectibles: {},
			allTokens: {},
			collectibles: [],
			contractExchangeRates: {},
			featureFlags: {},
			identities: {},
			lostIdentities: {},
			network: 'loading',
			provider: { type: 'rinkeby' },
			selectedAddress: '',
			tokens: []
		});
	});

	it('should get and set new stores', () => {
		const controller = new ComposableController();
		const addressBook = new AddressBookController();
		controller.controllers = [addressBook];
		expect(controller.controllers).toEqual([addressBook]);
	});

	it('should set initial state', () => {
		const state = {
			AddressBookController: {
				addressBook: [
					{
						address: 'bar',
						name: 'foo'
					}
				]
			}
		};
		const controller = new ComposableController([new AddressBookController()], state);
		expect(controller.state).toEqual(state);
	});

	it('should notify listeners of nested state change', () => {
		const addressBookController = new AddressBookController();
		const controller = new ComposableController([addressBookController]);
		const listener = stub();
		controller.subscribe(listener);
		addressBookController.set('1337', 'foo');
		expect(listener.calledOnce).toBe(true);
		expect(listener.getCall(0).args[0]).toEqual({
			AddressBookController: {
				addressBook: [{ address: '1337', name: 'foo' }]
			}
		});
	});
});
