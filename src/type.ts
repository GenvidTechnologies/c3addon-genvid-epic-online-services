
const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Genvid_EOS;

PLUGIN_CLASS.Type = class GenvidEOSType extends SDK.ITypeBase
{
	constructor(sdkPlugin: SDK.IPluginBase, iObjectType: SDK.IObjectType)
	{
		super(sdkPlugin, iObjectType);
	}
};

export {}