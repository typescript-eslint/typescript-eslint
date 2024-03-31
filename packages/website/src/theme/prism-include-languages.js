import siteConfig from '@generated/docusaurus.config';

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: { prism },
  } = siteConfig;
  const { additionalLanguages } = prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach(lang => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(`prismjs/components/prism-${lang}`);
  });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`../prism/language/jsonc`);
  delete globalThis.Prism;
}
