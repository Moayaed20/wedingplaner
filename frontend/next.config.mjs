const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "mir-s3-cdn-cf.behance.net" },
      { protocol: "https", hostname: "example.com" }, // للتجربة (سيتم استبداله)
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "http", hostname: "localhost", port: "3001" },
    ],
  },
};

export default nextConfig;
