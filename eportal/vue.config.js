/*
 * @Author: your name
 * @Date: 2019-10-31 14:56:34
 * @LastEditTime: 2019-10-31 16:29:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /mergeEpotal/eportal/vue.config.js
 */
module.exports = {
    // 修改的配置
    // 将baseUrl: '/api',改为baseUrl: '/',
    publicPath: '/',
    lintOnSave: false,
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000/',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                  '^/api': ''
                }
            },
            '/wx': {
                target: 'https://api.weixin.qq.com/',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/wx': ''
                },
            },
            '/mapCoord': {
                target: 'https://api.map.baidu.com',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/mapCoord': ''
                }
            }
        }
    }
}