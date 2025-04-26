
import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Cnds =
{
	OnInitializationSuccess(this: SDKInstanceClass) {
		return true;
	},
	OnInitializationError(this: SDKInstanceClass) {
		return true;
	},
	IsInitialized(this: SDKInstanceClass) {
		return this._initialized;
	},
	// auth module
	OnLoginPersistentSuccess(this: SDKInstanceClass) {
		return true;
	},
	OnLoginPersistentError(this: SDKInstanceClass) {
		return true;
	},
	OnLoginPortalSuccess(this: SDKInstanceClass) {
		return true;
	},
	OnLoginPortalError(this: SDKInstanceClass) {
		return true;
	},
	OnLogoutSuccess(this: SDKInstanceClass) {
		return true;
	},
	OnLogoutError(this: SDKInstanceClass) {
		return true;
	},
	OnLoginStateChange(this: SDKInstanceClass) {
		return true;
	},
	IsLoggedIn(this: SDKInstanceClass) {
		return this._loggedIn;
	},
	// ecom - entitlements
	OnGetEntitlements(this: SDKInstanceClass) {
		return true;
	},
	OnGetEntitlementsError(this: SDKInstanceClass) {
		return true;
	},
	// ecom - offers
	OnGetOffers(this: SDKInstanceClass) {
		return true;
	},
	OnGetOffersError(this: SDKInstanceClass) {
		return true;
	},
	// ecom - checkout
	OnCheckout(this: SDKInstanceClass, tag: string) {
		return this._checkoutTag === tag;
	},
	OnCheckoutError(this: SDKInstanceClass, tag: string) {
		return this._checkoutTag === tag;
	},
	OnAnyCheckout(this: SDKInstanceClass) {
		return true;
	},
	OnAnyCheckoutError(this: SDKInstanceClass) {
		return true;
	}
};
