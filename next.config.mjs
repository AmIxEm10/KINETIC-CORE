/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // `standalone` produces a self-contained Node server at `.next/standalone`.
  // Electron spawns this bundle as a child process so the game ships with
  // zero external runtime dependencies beyond the bundled Node.
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-three/drei']
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source'
    });
    return config;
  }
};

export default nextConfig;
