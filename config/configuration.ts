export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),

  mongodbUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
  },

  elasticsearchHost: process.env.ELASTICSEARCH_HOST,
});