const C3 = globalThis.C3;

// Update the DOM_COMPONENT_ID to be unique to your plugin.
// It must match the value set in domSide.js as well.
const DOM_COMPONENT_ID = "Genvid_EOS";

// To circumvent typescript lint warnings
interface C3DebuggerProperty {
  name: string,
  value: number | string | boolean;
}

interface C3DebuggerPropertiesSection {
  title: string;
  properties: C3DebuggerProperty[]
};

type LoginState = "inProgress" | "loggedIn" | "loggedOut";
const LogLevels = [
  "none",
  "error",
  "warn",
  "info",
  "debug"
];

class EOSInstance extends globalThis.ISDKInstanceBase {
  _configLoaded = false;
  _sdkConfig: Partial<EOSSDKConfig> = {};
  _initialized = false;
  _logLevel?: string;
  _lastError = "";

  // Auth
  _loggedIn = false;
  _accountId = "";
  _username = "";
  _token = "";
  _loginStatus: LoginState = "loggedOut";
  
  // ECom
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
    this._configLoaded = false;
    this._lastError = "";
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

    this._logLevel = "none";
    const properties = this._getInitProperties();
		if (properties)		// note properties may be null in some cases
		{
			this._logLevel = LogLevels[properties[0] as number];
		}

    this.runtime.assets.fetchJson("eos_config.json")
      .then(config => {
        this._sdkConfig.ProductName = this.runtime.projectName;
        this._sdkConfig.ProductVersion = this.runtime.projectVersion;
        const cleanConfig = Object.fromEntries(Object.entries(config).filter(([,v]) => !!v));
        Object.assign(this._sdkConfig, cleanConfig);
      })
      .catch((err) => {
        console.error(`EOS Addon: Error fetching default config: ${err.message}`);
      })
      .finally(() => {
        this._configLoaded = true;
        this._trigger(C3.Plugins.Genvid_EOS.OnConfigurationLoaded);
      });

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

  // eslint-disable-next-line: @typescript-eslint/no-explicit-any
  _getSDKDebuggerProperties(prefix: string): C3DebuggerPropertiesSection[] {
    return [
      {
        title: prefix + "title",
        properties: [
          { name: prefix + "initialized", value: this._initialized },
          { name: prefix + "console-log-level", value: this._logLevel ?? "none" },
          { name: prefix + "loaded", value: this._configLoaded },
          { name: prefix + "product-name", value: this._sdkConfig.ProductName ?? "" },
          { name: prefix + "product-id", value: this._sdkConfig.ProductId ?? "" },
          { name: prefix + "product-version", value: this._sdkConfig.ProductVersion ?? "" },
          { name: prefix + "sandbox-id", value: this._sdkConfig.SandboxId ?? "" },
          { name: prefix + "deployment-id", value: this._sdkConfig.DeploymentId ?? "" },
          { name: prefix + "client-id", value: this._sdkConfig.ClientId ?? "" },
          { name: prefix + "client-secret", value: this._sdkConfig.ClientSecret ?? "" },
        ],
      },
    ];
  }

  _getAuthDebuggerProperties(_prefix: string): C3DebuggerPropertiesSection[] {
    const prefix = _prefix + "auth.";
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

  _getEcomEntitlementsDebuggerProperties(_prefix: string): C3DebuggerPropertiesSection[] {
    if (this._entitlements.length > 0) {
      const prefix = _prefix + "entitlements.";
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
  _getEcomOffersDebuggerProperties(_prefix: string): C3DebuggerPropertiesSection[] {
    if (this._offers.length > 0) {
      const prefix = _prefix + "offers.";
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

  _getEcomCheckoutDebuggerProperties(_prefix: string): C3DebuggerPropertiesSection[] {
    if (this._checkoutTransaction) {
      const prefix = _prefix + "checkout.";
      const entitlements = this._checkoutTransaction!.NewEntitlements?.map((e, i) => ({
        name: `$NewEntitlement[${i}]`, value: JSON.stringify(e)
      }));
      return [
        {
          title: prefix + 'title',
          properties: [
            { name: prefix + 'transactionId', value: this._checkoutTransaction?.TransactionId ?? "" },
            ...entitlements
          ]
        }
      ];
    } else {
      return [];
    }
  }

  _getEcomDebuggerProperties(_prefix: string): C3DebuggerPropertiesSection[] {
    const prefix = _prefix + "ecom.";
    return [
      ...this._getEcomEntitlementsDebuggerProperties(prefix),
      ...this._getEcomOffersDebuggerProperties(prefix),
      ...this._getEcomCheckoutDebuggerProperties(prefix),
    ]
  }

  _getDebuggerProperties(): C3DebuggerPropertiesSection[] {
    const prefix = "plugins.genvid_eos.debugger.";
    return [
      ...this._getSDKDebuggerProperties(prefix),
      ...this._getAuthDebuggerProperties(prefix),
      ...this._getEcomDebuggerProperties(prefix)
    ]
  }

  _saveToJson() {
    return {
      // data to be saved for savegames
    };
  }

  _loadFromJson(/*o: JSONValue*/) {
    // load state for savegames
  }
}

C3.Plugins.Genvid_EOS.Instance = EOSInstance;

export type { EOSInstance as SDKInstanceClass };
