/** Lighthouse CI: fails if any category on any page scores below 95. */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/',
        'http://localhost/es/',
        'http://localhost/projects/agency-console/',
        'http://localhost/es/projects/coaching-platform/',
        'http://localhost/lab/',
      ],
      // 3 runs per URL: a single cold run on a shared CI runner is too noisy.
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      // Classic site: 95+ everywhere. Interactive /lab/ (WebGL): 85+ performance, 95+ the rest.
      assertMatrix: [
        {
          matchingUrlPattern: '^(?!.*/lab/).*$',
          assertions: {
            'categories:performance': ['error', { minScore: 0.95 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': ['error', { minScore: 0.95 }],
          },
        },
        {
          matchingUrlPattern: '.*/lab/.*',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': ['error', { minScore: 0.95 }],
          },
        },
      ],
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};
