//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
import {composePlugins, withNx} from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    // Use this to set Nx-specific options
    // See: https://nx.dev/recipes/next/next-config-setup
    nx: {},
    serverExternalPackages: ["knex", "mysql2"],
  async headers() {
    return [
      {
        // Applies to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:19000",
          },
          {
            key:"Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

const plugins = [
    // Add more Next.js plugins to this list if needed.
    withNx,
];

export default composePlugins(...plugins)(nextConfig);
