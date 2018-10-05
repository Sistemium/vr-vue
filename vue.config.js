module.exports = {
  devServer: {
    proxy: {
      '/api/vr': {
        target: 'http://localhost:9100',
        changeOrigin: true,
        pathRewrite: {
          '^/api/vr': '/api',
        },
      },
    },
  },
};
