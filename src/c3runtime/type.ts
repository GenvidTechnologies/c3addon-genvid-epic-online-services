
import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Genvid_EOS.Type = class GenvidEOSType extends globalThis.ISDKObjectTypeBase<SDKInstanceClass>
{
	constructor()
	{
		super();
	}
	
	_onCreate()
	{	
	}
};
