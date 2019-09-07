'use strict';

const path = require('path');
const fs = require('fs');
const setDirPath = '../cartridges';
const allDirBuild = "base";

/**
 * Collect All Dynamic cartridges directories find logic
 */
class WebPackDir{
	static readSfraDir()
	{
		let findDir = [];
		const jsDir_Path = setDirPath;
		const arrayOfDirs = fs.readdirSync(jsDir_Path);
		arrayOfDirs.forEach( function (getDir,index) {
			if(getDir != 'modules' && getDir != 'lib_productlist'){	
			 findDir.push(`${jsDir_Path}/${getDir}`);      // ES6 syntax 
			}
		})
		console.log(findDir);
		return findDir;
	}
}

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
    // enter all aliases to configure
    alias : {
        
		base: path.resolve(
            process.cwd(),
			`${setDirPath}/app_storefront_base/cartridge/client/default/js`    // ES6 syntax 
            
        ),
		baseCSS: path.resolve(
            process.cwd(),
			`${setDirPath}/app_storefront_base/cartridge/client/default/scss`    // ES6 syntax 
            
        )
    }
 
}

/**
 * Exposes cartridges included in the project
 */

switch(allDirBuild) {
  case "base":
    module.exports.cartridges = [setDirPath+'/app_storefront_base'];
    break;
  case "custom":
    module.exports.cartridges = [setDirPath+'/app_storefront_custom'];
    break;
  case "all":
    module.exports.cartridges = WebPackDir.readSfraDir();
    break;
}
