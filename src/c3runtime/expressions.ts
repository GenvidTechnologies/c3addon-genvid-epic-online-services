
import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Exps =
{
	AccountId(this: SDKInstanceClass)
	{
		return this._accountId;
	},
	Username(this: SDKInstanceClass)
	{
		return this._username;
	},
	LoggingStatus(this: SDKInstanceClass)
	{
		return this._loginStatus;
	},
	Token(this: SDKInstanceClass)
	{
		return this._token;
	}
};
