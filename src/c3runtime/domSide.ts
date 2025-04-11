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
            ]);
        }

        get eos(): EOS {
            return globalThis['plugins']['eos'];
        }

        // Callback for EOS SDK
        _onStateChange(state: EOSLoginStatus) {
            this.PostToRuntime('on-state-change', { ...state });
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
            const success =  await this.eos['login'](persistent as boolean);
            if (success) {
                return {
                    result: true,
                    accountId: await this.eos['getAccountId'](),
                    username: await this.eos['getUsername'](),
                    token: await this.eos['getAuthToken'](),
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
                result: await this.eos['logout']()
            }
        }

        async _OnUpdate(): Promise<JSONObject>
        {
            // TODO: Move this into cordova plugin to avoid the back and forth.
            const result = {
                initialized: this.eos.initialized,
                loggedIn: false,
                accountId: '',
                username: '',
                token: ''
            };
            if (result.initialized) {
                result.loggedIn = await this.eos.isLoggedIn();
            }
            if (result.loggedIn) {
                result.accountId = await this.eos.getAccountId();
                result.username = await this.eos.getUsername();
                result.token = await this.eos.getAuthToken();
            }
            return result;
        }
    };

    globalThis.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}