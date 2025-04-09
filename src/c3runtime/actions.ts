import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Acts = {
  Initialize(this: SDKInstanceClass) {
    return this._postToDOMAsync("initialize", {})
      .then(() => {
        this._initialized = true;
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationSuccess);
      })
      .catch(() => {
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnInitializationError);
      });
  },
  OnNetworkChange(this: SDKInstanceClass, connected: boolean) {
    return this._postToDOM("network-change", { connected });
  },
  LoginPersistent(this: SDKInstanceClass) {
    return this._postToDOMAsync("login", { persistent: true })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(() =>
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPersistentError)
      );
  },
  LoginPortal(this: SDKInstanceClass) {
    return this._postToDOMAsync("login", { persistent: false })
      .then((result) => this._onLoginResult(result as JSONObject))
      .catch(() =>
        this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLoginPortalError)
      );
  },
  Logout(this: SDKInstanceClass) {
    return this._postToDOMAsync("logout")
      .then((result) => this._onLogoutResult(result as JSONObject))
      .catch(() => this._trigger(C3.Plugins.Genvid_EOS.Cnds.OnLogoutError));
  },
};
