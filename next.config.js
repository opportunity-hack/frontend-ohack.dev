module.exports = { 
    async rewrites() {
      return [
        {
          source: '/hack/:path*/sponsor',
          destination: '/sponsor',
        },
      ];
    },
    images : { 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.giphy.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
        {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
            port: '',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'avatars.slack-edge.com',
            port: '',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'secure.gravatar.com',
            port: '',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'cdn.ohack.dev',
            port: '',
            pathname: '/**',
        },

    ]}
}