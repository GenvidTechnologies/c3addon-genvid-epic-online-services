const C3 = globalThis.C3;

// Update the DOM_COMPONENT_ID to be unique to your plugin.
// It must match the value set in domSide.js as well.
const DOM_COMPONENT_ID = "Genvid_EOS";

type LoginState = "inProgress" | "loggedIn" | "loggedOut";

class EOSInstance extends globalThis.ISDKInstanceBase {
  _loggedIn = false;
  _initialized = false;
  _accountId = "";
  _username = "";
  _token = "";
  _loginStatus: LoginState = "loggedOut";
  _entitlements: Array<EosEntitlement> = [];
  _offers: Array<EosOffer> = [];
  _checkoutOffers: Array<string> = [];
  _checkoutTransaction?: EosTransaction;
  _checkoutTag?: string;

  constructor() {
    // Note that DOM_COMPONENT_ID must be passed to the base class as an additional parameter.
    super({ domComponentId: DOM_COMPONENT_ID });

    this._loggedIn = false;
    this._initialized = false;
    this._accountId = "";
    this._username = "";
    this._token = "";
    this._loginStatus = "loggedOut";
    // ecom
    this._entitlements = [];
    this._offers = [];
    this._checkoutOffers = [];
    this._checkoutTransaction = undefined;
    this._checkoutTag = undefined;

    this._addDOMMessageHandler("on-state-change", (e) =>
      this._onStateChange(e)
    );
  }

  _onStateChange(value?: JSONValue) {
    if (value) {
      const state = value as JSONObject;
      this._loginStatus = state.status as LoginState;
    }
    this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginStateChange);
  }

  _onLoginResult(value: JSONObject) {
    const persistent = value.persistent as boolean;
    if (value.result as boolean) {
      this._loggedIn = true;
      this._accountId = value.accountId as string;
      this._username = value.username as string;
      this._token = value.token as string;
      this._onStateChange(); // Just called it to signal the change.
      this._trigger(
        persistent
          ? C3.Plugins.Genvid_EOS.Cnds.OnLoginPersistentSuccess
          : C3.Plugins.Genvid_EOS.Cnds.OnLoginPortalSuccess
      );
    } else {
      this._loggedIn = false;
      this._accountId = "";
      this._username = "";
      this._token = "";
      this._onStateChange(); // Just called it to signal the change.
      this._trigger(
        persistent
          ? C3.Plugins.Genvid_EOS.Cnds.OnLoginPersistentError
          : C3.Plugins.Genvid_EOS.Cnds.OnLoginPortalError
      );
    }
  }

  _onLogoutResult(value: JSONObject) {
    if (value.result as boolean) {
      this._loggedIn = false;
      this._accountId = "";
      this._username = "";
      this._token = "";
      this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutSuccess);
    } else {
      this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutError);
    }
  }

  _onGetEntitlements(value: JSONObject) {
    this._entitlements = value.entitlements as unknown as Array<EosEntitlement>;
  }

  _onGetOffers(value: JSONObject) {
    this._offers = value.offers as unknown as Array<EosOffer>;
  }

  _getOfferByIndex(index: number, withItems: boolean = true) {
    const { ...offer } = this._offers[index];
    if (offer && !withItems) {
      offer.Items = [];
    }
    return offer;
  }

  _getOfferById(id: string, withItems: boolean = true) {
    const { ...offer } = this._offers.find(o => o.Id === id);
    if (offer && !withItems) {
      offer.Items = [];
    }
    return offer;
  }

  _getOfferItemsByIndex(index: number) {
    return this._offers[index]?.Items ?? [];
  }

  _getOfferItemsById(id: string) {
    return this._offers.find(o => o.Id === id)?.Items ?? [];
  }

  _getTransactionsEntitlements(): Array<EosEntitlement> {
    return this._checkoutTransaction?.NewEntitlements ?? [];
  }

  async _updateState() {
    try {
      const state = await this._postToDOMAsync("update") as JSONObject;
      this._initialized = state.initialized as boolean;
      this._loggedIn = state.loggedIn as boolean;
      this._accountId = state.account as string;
      this._username = state.username as string;
      this._token = state.token as string;
      this._onStateChange();
    } catch(err) {
      console.error(`Error updating state: ${(err as Error).message}`);
    }
  }

  _release() {
    super._release();
  }

  _getSDKDebuggerProperties(): any[] {
    const prefix = "plugins.genvid_eos.debugger.";
    return [
      {
        title: prefix + "title",
        properties: [
          { name: prefix + "initialized", value: this._initialized },
        ],
      },
    ];
  }

  _getAuthDebuggerProperties(): any[] {
    const prefix = "plugins.genvid_eos.debugger.auth.";
    return [
      {
        title: prefix + "title",
        properties: [
          { name: prefix + "state", value: this._loginStatus },
          { name: prefix + "logged", value: this._loggedIn },
          { name: prefix + "username", value: this._username },
          { name: prefix + "accountid", value: this._accountId },
          { name: prefix + "token", value: this._token },
        ],
      },
    ];
  }

  _getEcomEntitlementsDebuggerProperties() {
    if (this._entitlements.length > 0) {
      const prefix = "plugins.genvid_eos.debugger.ecom.entitlements.";
      return [
        {
          title: prefix + 'title',
          properties: this._entitlements.map((e, i) => ({
            name: `$Entitlements[${i}]`, value: JSON.stringify(e)
          }))
        }
      ];
    } else {
      return [];
    }
  }
  _getEcomOffersDebuggerProperties() {
    if (this._offers.length > 0) {
      const prefix = "plugins.genvid_eos.debugger.ecom.offers.";
      return [
        {
          title: prefix + 'title',
          properties: this._entitlements.map((o, i) => ({
            name: `$Offers[${i}]`, value: JSON.stringify(o)
          }))
        }
      ];
    } else {
       return [];
    }
  }

  _getEcomCheckoutDebuggerProperties() {
    if (this._checkoutTransaction) {
      const prefix = "plugins.genvid_eos.debugger.ecom.checkout.";
      const entitlements = this._checkoutTransaction!.NewEntitlements?.map((e, i) => ({
        name: `$NewEntitlement[${i}]`, value: JSON.stringify(e)
      }));
      return [
        {
          title: prefix + 'title',
          properties: {
            name: prefix + 'transactionId', value: this._checkoutTransaction?.TransactionId ?? "",
            ...entitlements
          }
        }
      ];
    } else {
      return [];
    }
  }

  _getEcomDebuggerProperties(): any[] {
    const prefix = "plugins.genvid_eos.debugger.ecom.";
    return [
      ...this._getEcomEntitlementsDebuggerProperties(),
      ...this._getEcomOffersDebuggerProperties(),
      ...this._getEcomCheckoutDebuggerProperties(),
    ]
  }

  _getDebuggerProperties(): any[] {
    return [
      ...this._getSDKDebuggerProperties(),
      ...this._getAuthDebuggerProperties(),
      ...this._getEcomDebuggerProperties()
    ]
  }

  _saveToJson() {
    return {
      // data to be saved for savegames
    };
  }

  _loadFromJson(o: JSONValue) {
    // load state for savegames
  }
}

C3.Plugins.Genvid_EOS.Instance = EOSInstance;

export type { EOSInstance as SDKInstanceClass };
