// // import { logger } from '@/libs/logger';
// import { createClient } from 'redis';

// export const redis = {
//   host: process.env.REDIS_HOST || '',
//   port: parseInt(process.env.REDIS_PORT || '0'),
//   password: process.env.REDIS_PASSWORD || '',
// };

// export const caching = {
//   contentCacheDuration: parseInt(process.env.CONTENT_CACHE_DURATION_MILLIS || '600000'),
// };

// const client = createClient({
//   password: 'I2mzky8qMbVE1Kfl7BN7wpEMJFYiOn2i',
//   socket: {
//       host: 'redis-19131.c264.ap-south-1-1.ec2.cloud.redislabs.com',
//       port: 19131,
//   }
// });
// console.log(client);

// client.on('connect', () => logger.info('Cache is connecting'));
// client.on('ready', () => logger.info('Cache is ready'));
// client.on('end', () => logger.info('Cache disconnected'));
// client.on('reconnecting', () => logger.info('Cache is reconnecting'));
// client.on('error', (e) => logger.error(e));

// (async () => {
//   // await client.connect();
// })();

// // If the Node process ends, close the Cache connection
// process.on('SIGINT', async () => {
//   // await client.disconnect();
// });

// export default client;
