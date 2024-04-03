# SFRA Webpack Multi Cartridges builder 

## Limitation of default sfra webpack bundling
- Supported only Nodejs 12 & 14 versions
- At the same time only single cartridge js & scss can be compiled. 
- To list custom cartridge we need to explicitly mention ‘packageName’ variable in package.json.
- All custom cartridges bundling (js & scss files) gets created in single ‘app_storefront_base’ cartridge static folder.
- JS & CSS conflict issues could arise in future.
- Does not have implicit eslint validation.

## Why use it?

This plugin let you bundle all your `js`, `scss` files out of the box.

- One pre-build `webpack.config.js` for all cartridges and plugins
- Supports multi-cartridges project due to simple configuration
- Supports aliases for `require` loading

## Prerequisite

- Install [SFRA](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture) 
- Run `npm install` to install all needed `node_modules`
- This custom sfra builder folder place it in a root folder structure like this

**Other structures are also supported as long as you configure the path accordingly in `sfraBuilderConfig.js`**

Example Structure

```
.
+-- storefront-reference-architecture-master
+-- sfra-webpack-multicartridges-builder
+-- int_certona_sfra
+-- plugin_wishlists
+-- app_storefront_custom
+-- ...  
```

## Usage

- Run `npm install`.
- `sfraBuilderConfig.js` to define your own config.
- Configure cartridges and aliases in `sfraBuilderConfig.js` (Ensure that the paths in `sfraBuilderConfig.js` point correctly to the included SFRA and plugins according to your directory structure)

- Set “setDirPath” for root cartridges folder

- Set “allDirBuild” : all or base or custom

	custom : Developer can pass the comma separated cartridges or plugin name in switch case section and bases on that bundle 
	process should applicable on particular folder.

	base  :  Default app_strorefront_base cartridge bundle.

	all :  Except modules, all cartridges folders bundle 

- Run `npm run watch` or `npm run prod` or `npm run dev`. This will compile all related `js & css` files included in the directories which are defined in `sfraBuilderConfig.js`

### Aliases

`module.exports.aliasConfig` let you specify, how to load module packages inside your plugin.

```js
module.exports.aliasConfig = {
    // enter all aliases to configure
    base: path.resolve(
        process.cwd(),
        '../cartridges/app_storefront_base/cartridge/client/default/js'
    ),
	baseCSS: path.resolve(
        process.cwd(),
        '../cartridges/app_storefront_base/cartridge/client/default/scss'
    ),
    CustomPlugin: path.resolve(
        process.cwd(),
        '../cartridges/plugin_custom/cartridge/client/default/js'
    )
}
```

`CustomPlugin` allows to retrieve use modules through cartridges using `require('CustomPlugin/myFile.js');` or `import Foo from CustomPlugin/myFile`;
