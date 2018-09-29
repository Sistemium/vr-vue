module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:9100',
        changeOrigin: true,
      },
    },
  },
};
