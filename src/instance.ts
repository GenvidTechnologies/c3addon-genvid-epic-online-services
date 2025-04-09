
const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Genvid_EOS;

PLUGIN_CLASS.Instance = class EOSInstance extends SDK.IInstanceBase
{
	constructor(sdkType: SDK.ITypeBase, inst: SDK.IObjectInstance)
	{
		super(sdkType, inst);
	}
	
	Release()
	{
	}
	
	OnCreate()
	{
	}
	
	OnPropertyChanged(id: string, value: EditorPropertyValueType)
	{
	}
};

export {}