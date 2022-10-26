import siteConfig from '@generated/docusaurus.config';

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: { prism },
  } = siteConfig;
  const { additionalLanguages } = prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach(lang => {
    require(`prismjs/components/prism-${lang}`); // eslint-disable-line
  });

  require(`../prism/language/jsonc`);
  delete globalThis.Prism;
}
