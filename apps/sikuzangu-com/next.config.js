//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
import {composePlugins, withNx} from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    // Use this to set Nx-specific options
    // See: https://nx.dev/recipes/next/next-config-setup
    output: 'standalone',
    nx: {},
    serverExternalPackages: ["knex", "mysql2"],
    images: {
        domains: ['images.pexels.com', 'sikuzangu.org', 'placehold.co']
    },
    async headers() {
        return [
            {
                // Applies to all API routes
                source: "/api/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "http://localhost:8081",
                    },
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true"
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version",
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
