import siteConfig from '@generated/docusaurus.config';

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: { prism },
  } = siteConfig;
  const { additionalLanguages } = prism;
  globalThis.Prism = PrismObject;

  for (const lang of additionalLanguages) {
    require(`prismjs/components/prism-${lang}`);
  }

  require(`../prism/language/jsonc`);
  delete globalThis.Prism;
}
