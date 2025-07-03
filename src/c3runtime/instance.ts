const C3 = globalThis.C3;

// Update the DOM_COMPONENT_ID to be unique to your plugin.
// It must match the value set in domSide.js as well.
const DOM_COMPONENT_ID = "Genvid_EOS";

// To circumvent typescript lint warnings
interface EosC3DebuggerProperty {
  name: string;
  value: number | string | boolean;
}

interface EosC3DebuggerPropertiesSection {
  title: string;
  properties: EosC3DebuggerProperty[];
}

type EosLoginState = "inProgress" | "loggedIn" | "loggedOut";
type EosLogLevel = "none" | "error" | "warn" | "info" | "debug";
export const EOS_LOG_LEVELS: Array<EosLogLevel> = ["none", "error", "warn", "info", "debug"];

class EOSInstance extends ISDKInstanceBase {
  
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
  _loginStatus: EosLoginState = "loggedOut";

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
    if (properties) {
      // note properties may be null in some cases
      this._logLevel = EOS_LOG_LEVELS[properties[0] as number];
    }

    this.runtime.assets
      .fetchJson("eos_config.json")
      .then((config) => {
        this._sdkConfig.ProductName = this.runtime.projectName;
        this._sdkConfig.ProductVersion = this.runtime.projectVersion;
        const cleanConfig = Object.fromEntries(
          Object.entries(config).filter(([, v]) => !!v)
        );
        Object.assign(this._sdkConfig, cleanConfig);
      })
      .catch((err) => {
        console.error(
          `EOS Addon: Error fetching default config: ${err.message}`
        );
      })
      .finally(() => {
        this._configLoaded = true;
        this._trigger(C3.Plugins.Genvid_EOS.OnConfigurationLoaded);
      });

    this._addDOMMessageHandler("on-state-change", (e) =>
      this._onStateChange(e)
    );
  }

  _onStateChange(value?: JSONValue): EosLoginState {
    if (value) {
      const state = value as JSONObject;
      this._loginStatus = state.status as EosLoginState;
    }
    this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginStateChange);
    return this._loginStatus;
  }

  _onLoginResult(value: JSONObject): boolean {
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
      return true;
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
      return false;
    }
  }

  _onLogoutResult(value: JSONObject): boolean {
    if (value.result as boolean) {
      this._loggedIn = false;
      this._accountId = "";
      this._username = "";
      this._token = "";
      this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutSuccess);
      return true;
    } else {
      this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutError);
      return false;
    }
  }

  _onGetEntitlements(value: JSONObject): Array<EosEntitlement> {
    this._entitlements = value.entitlements as unknown as Array<EosEntitlement>;
    return this._entitlements;
  }

  _onGetOffers(value: JSONObject): Array<EosOffer> {
    this._offers = value.offers as unknown as Array<EosOffer>;
    return this._offers;
  }

  _getOfferByIndex(index: number, withItems: boolean = true): EosOffer | undefined {
    const { ...offer } = this._offers[index];
    if (offer && !withItems) {
      offer.Items = [];
    }
    return offer;
  }

  _getOfferById(id: string, withItems: boolean = true): EosOffer | undefined {
    const { ...offer } = this._offers.find((o) => o.Id === id);
    if (offer && !withItems) {
      offer.Items = [];
    }
    return offer;
  }

  _getOfferItemsByIndex(index: number): Array<EosItem> {
    return this._offers[index]?.Items ?? [];
  }

  _getOfferItemsById(id: string): Array<EosItem> {
    return this._offers.find((o) => o.Id === id)?.Items ?? [];
  }

  _getTransactionsEntitlements(): Array<EosEntitlement> {
    return this._checkoutTransaction?.NewEntitlements ?? [];
  }

  async _updateState(): Promise<void> {
    try {
      const state = (await this._postToDOMAsync("update")) as JSONObject;
      this._initialized = state.initialized as boolean;
      this._loggedIn = state.loggedIn as boolean;
      this._accountId = state.account as string;
      this._username = state.username as string;
      this._token = state.token as string;
      this._onStateChange();
    } catch (err) {
      console.error(`Error updating state: ${(err as Error).message}`);
    }
  }

  _release(): void {
    super._release();
  }

  // eslint-disable-next-line: @typescript-eslint/no-explicit-any
  _getSDKDebuggerProperties(prefix: string): EosC3DebuggerPropertiesSection[] {
    return [
      {
        title: prefix + "title",
        properties: [
          { name: prefix + "initialized", value: this._initialized },
          {
            name: prefix + "console-log-level",
            value: this._logLevel ?? "none",
          },
          { name: prefix + "loaded", value: this._configLoaded },
          {
            name: prefix + "product-name",
            value: this._sdkConfig.ProductName ?? "",
          },
          {
            name: prefix + "product-id",
            value: this._sdkConfig.ProductId ?? "",
          },
          {
            name: prefix + "product-version",
            value: this._sdkConfig.ProductVersion ?? "",
          },
          {
            name: prefix + "sandbox-id",
            value: this._sdkConfig.SandboxId ?? "",
          },
          {
            name: prefix + "deployment-id",
            value: this._sdkConfig.DeploymentId ?? "",
          },
          { name: prefix + "client-id", value: this._sdkConfig.ClientId ?? "" },
          {
            name: prefix + "client-secret",
            value: this._sdkConfig.ClientSecret ?? "",
          },
        ],
      },
    ];
  }

  _getAuthDebuggerProperties(_prefix: string): EosC3DebuggerPropertiesSection[] {
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

  _getEcomEntitlementsDebuggerProperties(
    _prefix: string
  ): EosC3DebuggerPropertiesSection[] {
    if (this._entitlements.length > 0) {
      const prefix = _prefix + "entitlements.";
      return [
        {
          title: prefix + "title",
          properties: this._entitlements.map((e, i) => ({
            name: `$Entitlements[${i}]`,
            value: JSON.stringify(e),
          })),
        },
      ];
    } else {
      return [];
    }
  }
  _getEcomOffersDebuggerProperties(
    _prefix: string
  ): EosC3DebuggerPropertiesSection[] {
    if (this._offers.length > 0) {
      const prefix = _prefix + "offers.";
      return [
        {
          title: prefix + "title",
          properties: this._entitlements.map((o, i) => ({
            name: `$Offers[${i}]`,
            value: JSON.stringify(o),
          })),
        },
      ];
    } else {
      return [];
    }
  }

  _getEcomCheckoutDebuggerProperties(
    _prefix: string
  ): EosC3DebuggerPropertiesSection[] {
    if (this._checkoutTransaction) {
      const prefix = _prefix + "checkout.";
      const entitlements = this._checkoutTransaction!.NewEntitlements?.map(
        (e, i) => ({
          name: `$NewEntitlement[${i}]`,
          value: JSON.stringify(e),
        })
      );
      return [
        {
          title: prefix + "title",
          properties: [
            {
              name: prefix + "transactionId",
              value: this._checkoutTransaction?.TransactionId ?? "",
            },
            ...entitlements,
          ],
        },
      ];
    } else {
      return [];
    }
  }

  _getEcomDebuggerProperties(_prefix: string): EosC3DebuggerPropertiesSection[] {
    const prefix = _prefix + "ecom.";
    return [
      ...this._getEcomEntitlementsDebuggerProperties(prefix),
      ...this._getEcomOffersDebuggerProperties(prefix),
      ...this._getEcomCheckoutDebuggerProperties(prefix),
    ];
  }

  _getDebuggerProperties(): EosC3DebuggerPropertiesSection[] {
    const prefix = "plugins.genvid_eos.debugger.";
    return [
      ...this._getSDKDebuggerProperties(prefix),
      ...this._getAuthDebuggerProperties(prefix),
      ...this._getEcomDebuggerProperties(prefix),
    ];
  }

  _saveToJson(): JSONValue {
    return {
      // data to be saved for savegames
    };
  }

  _loadFromJson(/*o: JSONValue*/): void {
    // load state for savegames
  }

  Initialize(): Promise<null | Error> {
    this._lastError = "";
    return this._postToDOMAsync("initialize", {
      logLevel: this._logLevel ?? "none",
      config: this._sdkConfig,
    })
      .then(async () => {
        this._initialized = true;
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationSuccess);
        return null;
      })
      .catch(async (err) => {
        this._lastError = err['message'] ?? err ?? ""; 
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationError);
        return new Error(this._lastError);
      });
  }

  LoginPersistent(): Promise<boolean | Error> {
    this._lastError = "";
    return this._postToDOMAsync("login", { persistent: true })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(async (err) => {
        this._lastError = err["message"] ?? err ?? "";
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPersistentError);
        return new Error(this._lastError);
      });
  }

  LoginPortal(): Promise<boolean | Error> {
    this._lastError = "";
    return this._postToDOMAsync("login", { persistent: false })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(async (err) => {
        this._lastError = err["message"] ?? err ?? "";
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPortalError);
        return new Error(this._lastError);
      });
  }

  Logout(): Promise<boolean | Error> {
    this._lastError = "";
    return this._postToDOMAsync("logout")
      .then((result) => this._onLogoutResult(result as JSONObject))
      .catch(async (err) => {
        this._lastError = err["message"] ?? err ?? "";
        await this._updateState();
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutError);
        return new Error(this._lastError);
      });
  }

  GetEntitlements(): Promise<Array<EosEntitlement> | Error> {
    this._lastError = "";
    return this._postToDOMAsync("get-entitlements")
      .then((result) => {
        const entitlements = this._onGetEntitlements(result as JSONObject);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetEntitlements);
        return entitlements;
      })
      .catch((err) => {
        this._lastError = err["message"] ?? err ?? "";
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetEntitlementsError);
        return new Error(this._lastError);
      });
  }

  GetOffers(): Promise<Array<EosOffer> | Error> {
    this._lastError = "";
    return this._postToDOMAsync("get-offers")
      .then((result) => {
        const offers = this._onGetOffers(result as JSONObject);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetOffers);
        return offers;
      })
      .catch((err) => {
        this._lastError = err["message"] ?? err ?? "";
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnGetOffersError);
        return new Error(this._lastError);
      });
  }

  Checkout(offers: string[], tag: string): Promise<EosTransaction | Error> {
    this._lastError = "";
    this._checkoutTag = tag;
    this._checkoutTransaction = undefined;
    return this._postToDOMAsync("checkout", { offers })
      .then((result) => {
        this._checkoutTransaction = result as unknown as EosTransaction;
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnCheckout);
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnAnyCheckout);
        return this._checkoutTransaction;
      })
      .catch((err) => {
        this._lastError = err['message'] ?? err ?? ""; 
        if (this._lastError.includes("EOS_Cancelled")) {
          this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnCheckoutCancelled);
          this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnAnyCheckoutCancelled);
        } else {
          this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnCheckoutError);
          this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnAnyCheckoutError);          
        }
        return new Error(this._lastError);
      });
  }
}

C3.Plugins.Genvid_EOS.Instance = EOSInstance;

export type { EOSInstance as SDKInstanceClass };
