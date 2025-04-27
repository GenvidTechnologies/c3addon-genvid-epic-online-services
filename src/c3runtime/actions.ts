import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Acts = {
  Initialize(this: SDKInstanceClass) {
    return this._postToDOMAsync("initialize", { logLevel: this._logLevel ?? "none" })
      .then(async () => {
        this._initialized = true;
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationSuccess);
      })
      .catch(async () => {
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationError);
      });
  },
  OnNetworkChange(this: SDKInstanceClass, connected: boolean) {
    return this._postToDOM("network-change", { connected });
  },

  // Auth module
  LoginPersistent(this: SDKInstanceClass) {
    return this._postToDOMAsync("login", { persistent: true })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(async () => {
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPersistentError);
      });
  },
  LoginPortal(this: SDKInstanceClass) {
    return this._postToDOMAsync("login", { persistent: false })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(async () => {
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPortalError);
      });
  },
  Logout(this: SDKInstanceClass) {
    return this._postToDOMAsync("logout")
      .then((result) => this._onLogoutResult(result as JSONObject))
      .catch(async () => {
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutError);
      });
  },

  // ecom - entitlements
  GetEntitlements(this: SDKInstanceClass) {
    return this._postToDOMAsync("get-entitlements")
      .then((result) => {
        this._onGetEntitlements(result as JSONObject);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetEntitlements);
      })
      .catch(() => {
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetEntitlementsError)
      });
  },
  // ecom - offers
  GetOffers(this: SDKInstanceClass) {
    return this._postToDOMAsync("get-offers")
      .then((result) => {
        this._onGetOffers(result as JSONObject);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetOffers)
      })
      .catch(() => {
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetOffersError);
      })
  },
  // ecom - checkout
  PlanCheckout(this: SDKInstanceClass, offerId: string) {
    this._checkoutOffers.push(offerId);
  },
  Checkout(this: SDKInstanceClass, tag: string) {
    const offers = this._checkoutOffers;
    this._checkoutOffers = [];
    this._checkoutTag = tag;
    this._checkoutTransaction = undefined;
    return this._postToDOMAsync("checkout", { offers })
      .then((result) => {
        this._checkoutTransaction = result as unknown as EosTransaction;
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnCheckout);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnAnyCheckout);
      })
      .catch(() => {
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnCheckoutError);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnAnyCheckoutError);
      });
  }
};
