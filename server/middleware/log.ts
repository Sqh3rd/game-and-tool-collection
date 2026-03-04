export default defineEventHandler(async (event) => {
  console.log(`New Request: ${getRequestURL(event)}`);
});
