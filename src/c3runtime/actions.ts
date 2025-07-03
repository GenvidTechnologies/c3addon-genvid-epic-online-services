import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Acts = {
  Initialize(this: SDKInstanceClass) {
    return this.Initialize();
  },

  SetProductName(this: SDKInstanceClass, productName: string) {
    this._sdkConfig.ProductName = productName;
  },

  SetProductVersion(this: SDKInstanceClass, productVersion: string) {
    this._sdkConfig.ProductVersion = productVersion;
  },

  SetProductId(this: SDKInstanceClass, productId: string) {
    this._sdkConfig.ProductId = productId;
  },

  SetSandboxId(this: SDKInstanceClass, sandboxId: string) {
    this._sdkConfig.SandboxId = sandboxId;
  },

  SetDeploymentId(this: SDKInstanceClass, deploymentId: string) {
    this._sdkConfig.DeploymentId = deploymentId;
  },

  SetClientId(this: SDKInstanceClass, clientId: string) {
    console.warn(
      "EOS ClientId override. It is recommended to always use eos_config.json to pass the client id since it is used during compilation."
    );
    this._sdkConfig.ClientId = clientId;
  },

  SetClientSecret(this: SDKInstanceClass, clientSecret: string) {
    this._sdkConfig.ClientSecret = clientSecret;
  },

  OnNetworkChange(this: SDKInstanceClass, connected: boolean) {
    return this._postToDOM("network-change", { connected });
  },

  // Auth module
  LoginPersistent(this: SDKInstanceClass) {
    return this.LoginPersistent();
  },
  LoginPortal(this: SDKInstanceClass) {
    return this.LoginPortal();
  },
  Logout(this: SDKInstanceClass) {
    return this.Logout();
  },

  // ecom - entitlements
  GetEntitlements(this: SDKInstanceClass) {
    return this.GetEntitlements();
  },
  // ecom - offers
  GetOffers(this: SDKInstanceClass) {
    return this.GetOffers();
  },
  // ecom - checkout
  PlanCheckout(this: SDKInstanceClass, offerId: string) {
    this._checkoutOffers.push(offerId);
  },
  Checkout(this: SDKInstanceClass, tag: string) {
    const promise = this.Checkout(this._checkoutOffers, tag);
    this._checkoutOffers = [];
    return promise;
  },
};
