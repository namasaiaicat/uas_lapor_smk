const nextConfig = {
  serverExternalPackages: ["@prisma/client", "mariadb"],
  experimental: {
    turbo: {
      resolveAlias: {
        ".prisma/client/default": "./node_modules/.prisma/client/default.js",
      },
    },
  },
};

export default nextConfig;
