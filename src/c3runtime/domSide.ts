"use strict";

{
    // Update the DOM_COMPONENT_ID to be unique to your plugin.
    // It must match the value set in instance.js as well.
    const DOM_COMPONENT_ID = "Genvid_EOS";

    // This class handles messages from the runtime, which may be in a Web Worker.
    const HANDLER_CLASS = class EOSDOMHandler extends globalThis.DOMHandler
    {
        constructor(iRuntime: IRuntimeInterface)
        {
            super(iRuntime, DOM_COMPONENT_ID);
            
            // This provides a table of message names to functions to call for those messages.
            this.AddRuntimeMessageHandlers([
                ["initialize",          async () => this._OnInitialize()],
                ["network-change",      e => this._OnNetworkChange(e)],
                ["login",               async e => this._OnLogin(e)],
                ["logout",              async () => this._OnLogout() ],
                ["update",              async () => this._OnUpdate() ],
                // ECom
                ["get-entitlements",    async () => this._OnGetEntitlements() ],
                ["get-offers",          async () => this._OnGetOffers() ],
                ["checkout",            async (r) => this._OnCheckout(r) ]
            ]);
        }

        get eos(): EOS {
            return globalThis['plugins']['eos'];
        }

        // Callback for EOS SDK
        _onStateChange(state: EOSLoginStatus) {
            this.PostToRuntime('on-state-change', { ...state });
        }

        get auth(): EosAuth {
            return this.eos['auth'];
        }
        
        get ecom(): EosEcom {
            return this.eos['ecom'];
        }

        async _OnInitialize(): Promise<void>
        {
            if (!this.eos['available']) {
                throw new Error('EOS is not available');
            }
            if (this.eos['initialized']) {
                throw new Error('EOS already initialized');
            }
            const response = await fetch('eos_config.json');
            const config = (await response.json()) as EOSSDKConfig;
            await this.eos['initializeSDK'](config, state => this._onStateChange(state));
        }

        _OnNetworkChange(e: JSONValue): void
        {
            const { connected } = e as JSONObject;
            if (connected) {
                this.eos['onConnect']();
            } else {
                this.eos['onDisconnect']();
            }
        }

        async _OnLogin(e: JSONValue): Promise<JSONValue> {
            const { persistent } = (e as JSONObject);
            const success =  await this.auth['login'](persistent as boolean);
            if (success) {
                return {
                    result: true,
                    accountId: await this.auth['getAccountId'](),
                    username: await this.auth['getUsername'](),
                    token: await this.auth['getAuthToken'](),
                    persistent,
                }
            } else {
                return {
                    result: false,
                    persistent,
                }
            }
        }

        async _OnLogout(): Promise<JSONValue>
        {
            return {
                result: await this.auth['logout']()
            }
        }

        async _OnUpdate(): Promise<JSONObject>
        {
            // TODO: Move this into cordova plugin to avoid the back and forth.
            const result = {
                initialized: this.eos['initialized'],
                loggedIn: false,
                accountId: '',
                username: '',
                token: ''
            };
            if (result.initialized) {
                result.loggedIn = await this.auth['isLoggedIn']();
            }
            if (result.loggedIn) {
                result.accountId = await this.auth['getAccountId']();
                result.username = await this.auth['getUsername']();
                result.token = await this.auth['getAuthToken']();
            }
            return result;
        }

        async _OnGetEntitlements(): Promise<JSONObject> {
            return {
                entitlements: [... (await this.ecom['queryEntitlements']()).map(x => x as unknown as JSONObject)]
            };
        }

        async _OnGetOffers(): Promise<JSONObject> {
            return {
                offers: [... (await this.ecom['queryOffers']()).map(x => x as unknown as JSONObject)]
            };
        }

        async _OnCheckout(data: JSONValue): Promise<JSONObject> {
            const queries = (data as JSONObject)['offers'] as Array<string>;
            return (await this.ecom['checkout'](queries)) as unknown as JSONObject;
        }
    };

    globalThis.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}