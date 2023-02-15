import siteConfig from '@generated/docusaurus.config';

// eslint-disable-next-line import/no-default-export -- needs to be default for docusaurus reasons
export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: { prism },
  } = siteConfig;
  const { additionalLanguages } = prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach(lang => {
    require(`prismjs/components/prism-${lang}`);
  });

  require(`../prism/language/jsonc`);
  delete globalThis.Prism;
}
