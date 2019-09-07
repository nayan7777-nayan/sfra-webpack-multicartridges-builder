'use strict';

const path = require('path');
const glob = require('glob');
const WebpackExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackCleanPlugin = require('clean-webpack-plugin');
const WebpackStyleLintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const sfraBuilderConfig = require('./sfraBuilderConfig');
process.noDeprecation = true; // property indicates whether the --no-deprecation flag is set on the current Node.js process

/**
 * Multicartridge webpack configuration.
 */
class WebpackBundle {

    /**
     * Scans the cartridge client side source folder and returns an
     * object with sass and javascript files.
     *
     * @param {string} cartridge - The cartridge name
     * @return {Object} - Object of sass and js files
     */
    static scanEntryPoints(cartridge = 'app_storefront_base') {
        const srcPath = path.resolve(__dirname, cartridge, 'cartridge/client');
        const srcSCSSPath = path.join(srcPath, '*', 'scss', '**', '*.scss');
        const srcJSPath = path.join(srcPath, '*', 'js', '**', '*.js');
        let files = {};
    
        // Scan scss files
        glob.sync(srcSCSSPath)
          .filter(source => !path.basename(source).startsWith('_'))
          .map((source) => {
              let sourceRelativePath = path.dirname(path.relative(srcPath, source));
              sourceRelativePath = sourceRelativePath.split(path.sep);
              sourceRelativePath[1] = sourceRelativePath[1].replace('scss', 'css');
              sourceRelativePath = sourceRelativePath.join(path.sep);

              const sourceName = path.basename(source).replace('scss', 'css');
              const outputFile = path.join(sourceRelativePath, sourceName);

              files[outputFile] = source;

              return source;
          });

        // Scan js files
        glob.sync(srcJSPath)
         .filter(source => !path.basename(source).startsWith('_'))
         .map((source) => {
             const sourceRelativePath = path.dirname(path.relative(srcPath, source));
             const sourceName = path.basename(source);
             const outputFile = path.join(sourceRelativePath, sourceName);

             files[outputFile] = source;

             return source;
         });

       
        return files;
    }

   /**
    * Base plugins.
    *
    * @return {array} - Array of Plugins
    */
    static getBasePlugins() {
        return [
            new WebpackStyleLintPlugin({ files: 'src/**/*.scss' }),
            new WebpackExtractTextPlugin('[name]')
        ];
    }

    /**
     * Returns the path to node_modules folder, relative from the cartridges path
     * @param {string} cartridge 
     */
    static getNodeModulesPaths(cartridge) {
        let nodeModulesPath = cartridge.split('/cartridges')[0]
        return path.resolve(__dirname, nodeModulesPath, 'node_modules');
    }

    /**
     * Returns the path to flag-icons folder, relative from the cartridges path.
     * @Fixme: Those are imported in a strange way in SFRA
     * @param {string} cartridge 
     */
    static getFlagIconsPaths(cartridge) {
        let nodeModulesPath = cartridge.split('/cartridges')[0]
        return path.resolve(__dirname, nodeModulesPath, 'node_modules/flag-icon-css/sass');
    }

   /**
    * Returns the webpack config object tree.
    *
    * @param {string} env - Environment variable
    * @param {string} cartridge - The cartridge name
    * @return {Object} - Webpack config
    */
    static bundleCartridge(env = 'dev', cartridge = 'app_storefront_base', config = {}) {
        const isDevelopment = (env !== undefined && env.dev === true);
        const enabledSourceMap = isDevelopment && cartridge !== 'app_storefront_base';
        const sourcePath = path.resolve(__dirname, cartridge, 'cartridge/client');
        const outputPath = path.resolve(__dirname, cartridge, 'cartridge', 'static');
        const cartridgeAlias = (config.alias !== undefined) ? config.alias: {};
        const nodeModulesPath = this.getNodeModulesPaths(cartridge);
        const flagIconsPath = this.getFlagIconsPaths(cartridge);
        let plugins = this.getBasePlugins(cartridge);

        const entryFiles =  this.scanEntryPoints(cartridge);
        if (Object.keys(entryFiles).length === 0) {
            // Cartridge does not include any static files to compile
            return {};
        }

        plugins.push(
            new WebpackCleanPlugin(['*/js', '*/css'], {
                root: path.resolve(__dirname, cartridge, 'cartridge', 'static'),
                verbose: false
            })
        );

        if (!isDevelopment) {
            plugins.push(
                new TerserPlugin()
            );
        }

        return {
            mode: isDevelopment ? 'development' : 'production',
            name: cartridge,
            stats: { children: false },
            entry: entryFiles,
            output: {
                path: outputPath,
                filename: '[name]'
            },
            resolve: {
                alias: cartridgeAlias,
				extensions: ['.css', '.scss', '.js', '.json']
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        include: sourcePath,
                        exclude: /node_modules/,
                        //use: ['eslint-loader'],
                        enforce: 'pre'
                    },
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    },
                    {
                        test: /\.scss$/,
                        loader: WebpackExtractTextPlugin.extract([
                            {
                                loader: 'css-loader',
                                options: {
                                    url: false,
                                    sourceMap: enabledSourceMap,
                                    minimize: !isDevelopment
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: () => [require('autoprefixer')]
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    includePaths: [nodeModulesPath, flagIconsPath],
                                    sourceMap: enabledSourceMap,
                                    minimize: !isDevelopment
                                }
                            }
                        ])
                    }
                ]
            },
            plugins: plugins,
            devtool: enabledSourceMap ? undefined : undefined,
            cache: true
        };
    }
}

module.exports = env => {
    return sfraBuilderConfig.cartridges.map(cartridge => {
        return WebpackBundle.bundleCartridge(env, cartridge, sfraBuilderConfig.aliasConfig);
    });
};