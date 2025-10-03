/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@genkit-ai/core',
    '@genkit-ai/googleai',
    'genkit',
  ],
}

module.exports = nextConfig
