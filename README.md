# Genvid Construct 3 Genvid Epic Online Services Addon

Addon for integrating cordova-plugin-eos to Construct 3

## Plugin

### Develop

The following start an http server:

```bash
npm run devmode
```

Because of the restricted CSP in Construct3, make sure to use <http://localhost:8080/addon.json> instead of 127.0.0.1.

### Build

```bash
npm run build
npm run zip:windows
```

## Sample

### Setup

You need to add `files/eos_config.json` with the correct information in it.
An example:

```json
{
    "ProductName": "Construct3 EOS Demo",
    "ProductVersion": "1.0.0.0",
    "ProductId": "xxxxx",
    "SandboxId": "yyyyy",
    "DeploymentId": "zzzzz",
    "ClientId": "wwwww",
    "ClientSecret": "very_secret"
}
```

### Build (Android only)

Unzip the Cordova for Android export, then:

```bash
npm install cordova
npx cordova plugin install file://<path/to/cordova-plugin/folder>/cordova-plugin-eos-1.0.0.tgz
npx cordova platform add android
npx cordova build android
```

**Important**: A bug in Construct 3 currently force modifying the `config.xml` preference
`android-targetSdkVersion` to `35`.
