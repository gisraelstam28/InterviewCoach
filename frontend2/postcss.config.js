// postcss.config.js
// Attempting to use the specific @tailwindcss/postcss package as per error message
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    // 'tailwindcss': {}, // Keeping this commented out as an alternative if the above fails
    autoprefixer: {},
  },
};
