
import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Exps =
{
	// SDK
	Configuration(this: SDKInstanceClass) {
		return JSON.stringify(this._sdkConfig);
	},

	// auth
	AccountId(this: SDKInstanceClass)
	{
		return this._accountId ?? "";
	},
	Username(this: SDKInstanceClass)
	{
		return this._username ?? "";
	},
	LoggingStatus(this: SDKInstanceClass)
	{
		return this._loginStatus ?? "";
	},
	Token(this: SDKInstanceClass)
	{
		return this._token ?? "";
	},
	// ecom - entitlements
	Entitlements(this: SDKInstanceClass) {
		return JSON.stringify(this._entitlements ?? []);
	},
	EntitlementsCount(this: SDKInstanceClass) {
		return this._entitlements?.length ?? 0;
	},
	EntitlementByIndex(this: SDKInstanceClass, index: number) {
		return JSON.stringify(this._entitlements?.[index] ?? null);
	},
	EntitlementById(this: SDKInstanceClass, id: string) {
		const entitlement = this._entitlements?.find(v => v.Id === id);
		return JSON.stringify(entitlement ?? null);
	},
	EntitlementByName(this: SDKInstanceClass, name: string) {
		const entitlement = this._entitlements?.find(v => v.Name === name);
		return JSON.stringify(entitlement ?? null);
	},
	// ecom - offers
	Offers(this: SDKInstanceClass) {
		return JSON.stringify(this._offers ?? []);
	},
	OffersCount(this: SDKInstanceClass) {
		return this._offers.length ?? 0;
	},
	OfferByIndex(this: SDKInstanceClass, index: number, withItems: number) {
		return JSON.stringify(this._getOfferByIndex(index, withItems !== 0) || null);
	},
	OfferById(this: SDKInstanceClass, id: string, withItems: number) {
		return JSON.stringify(this._getOfferById(id, withItems !== 0) || null);
	},
	OfferItemsByIndex(this: SDKInstanceClass, index: number) {
		return JSON.stringify(this._getOfferItemsByIndex(index) ?? null);
	},
	OfferItemsById(this: SDKInstanceClass, id: string) {
		return JSON.stringify(this._getOfferItemsById(id) ?? null);
	},
	OfferItemsCountByIndex(this: SDKInstanceClass, index: number) {
		return this._getOfferItemsByIndex(index).length ?? 0;
	},
	OfferItemsCountById(this: SDKInstanceClass, id: string) {
		return this._getOfferItemsById(id).length ?? 0;
	},
	OfferItemByIndex(this: SDKInstanceClass, offerIndex: number, itemIndex: number) {
		return JSON.stringify(
			this._getOfferItemsByIndex(offerIndex)[itemIndex] ?? null);
	},
	OfferItemById(this: SDKInstanceClass, offerId: string, itemIndex: number) {
		return JSON.stringify(
			this._getOfferItemsById(offerId)[itemIndex] ?? null);
	},
	// ecom - checkout
	TransactionTag(this: SDKInstanceClass) {
		return this._checkoutTag ?? "";
	},
	Transaction(this: SDKInstanceClass) {
		return JSON.stringify(this._checkoutTransaction ?? null);
	},
	TransactionId(this: SDKInstanceClass) {
		return this._checkoutTransaction?.TransactionId ?? "";
	},
	TransactionEntitlements(this: SDKInstanceClass) {
		return JSON.stringify(this._getTransactionsEntitlements() ?? []);
	},
	TransactionEntitlementsCount(this: SDKInstanceClass) {
		return this._getTransactionsEntitlements().length ?? 0;
	},
	TransactionEntitlementByIndex(this: SDKInstanceClass, index: number) {
		const entitlement = this._getTransactionsEntitlements()[index];
		return JSON.stringify(entitlement ?? null);
	},
};
