// Type definitions for cordova-plugin-eos
// Project: https://bitbucket.org/genvidtech/cordova-plugin-eos
// Definitions by: Microsoft Open Technologies Inc <http://msopentech.com>
//                 Tim Brust <https://github.com/timbru31>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * This plugin exposed some EOS services, including Platform, Authentication and EComm.
 */
interface EOSPlatform {

}

interface EOSComm {

}

type EOSSDKConfig = {
    ProductName: string;
    ProductVersion: string;
    ProductId: string;
    SandboxId: string;
    DeploymentId: string;
    ClientId: string; // Must match the one passed to the build
    ClientSecret: string;
}

interface EOSLoginStatus {
    status: "loggedIn" | "loggedOut" | "inProgress";
}

type onLoginChanged = function (EOSLoginStatus): void;

interface EOS {
    /** Indicates that Cordova initialize successfully. */
    available: boolean;
    initialized: boolean;
    sdkVersion?: string;
    /** Get the EOS SDK version. */
    initializeSDK(config: EOSSDKConfig, handler: onLoginChanged): Promise<boolean>;
    isLoggedIn(): Promise<boolean>;
    getUsername(): Promise<string>;
    getAccountId(): Promise<string>;
    getAuthToken(): Promise<string>;
    onConnect(): Promise<void>;
    onDisconnect(): Promise<void>;
    login(persistent: boolean): Promise<boolean>;
    logout(): Promise<boolean>;
    ecomm: EOSComm;
    platform: EOSPlatform;
}

declare var plugins: {
    eos: EOS;
};
