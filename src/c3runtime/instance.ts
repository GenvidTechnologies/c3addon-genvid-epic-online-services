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

  constructor() {
    // Note that DOM_COMPONENT_ID must be passed to the base class as an additional parameter.
    super({ domComponentId: DOM_COMPONENT_ID });

    this._loggedIn = false;
    this._initialized = false;
    this._accountId = "";
    this._username = "";
    this._token = "";
    this._loginStatus = "loggedOut";

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

  _release() {
    super._release();
  }

  _getDebuggerProperties(): any[] {
    const prefix = "plugins.genvid_eos.debugger.";
    return [
      {
        title: prefix + "title",
        properties: [
          { name: prefix + "initialized", value: this._initialized },
          { name: prefix + "state", value: this._loginStatus },
          { name: prefix + "logged", value: this._loggedIn },
          { name: prefix + "username", value: this._username },
          { name: prefix + "accountid", value: this._accountId },
          { name: prefix + "token", value: this._token },
        ],
      },
    ];
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
