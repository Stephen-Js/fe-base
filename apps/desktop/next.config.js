const nextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  transpilePackages: [
    '@repo/ui',
    '@repo/hooks',
    '@repo/pages',
    '@repo/store',
    '@repo/services',
    '@repo/utils',
  ],
  experimental: {
    optimizePackageImports: [
      '@repo/ui',
      '@repo/hooks',
      '@repo/store',
      '@repo/pages',
      '@repo/services',
      '@repo/utils',
      '@repo/api',
      'lucide-react',
    ],
  },
}
export default nextConfig
