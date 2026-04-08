import app from './app.js';

export default {
  async fetch(request, env, ctx) {
    // Hono handles the Fetch API request natively
    return await app.fetch(request, env, ctx);
  }
};
