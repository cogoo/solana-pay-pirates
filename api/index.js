/**
 * @param {import('@vercel/node').VercelRequest} request
 * @param {import('@vercel/node').VercelResponse} response
 * @returns {void}
 * */
export default function handler(
  request,
  response,
) {
  response.status(200).json();
}
