const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "example.com" }, // للتجربة (سيتم استبداله)
    ],
  },
};

export default nextConfig;
