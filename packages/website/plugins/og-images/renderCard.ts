import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type { Font } from 'satori';

import { initWasm, Resvg } from '@resvg/resvg-wasm';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createElement } from 'react';
import satori from 'satori';

const cardHeight = 630;
const cardWidth = 1200;

const colors = {
  accent: '#2656c7',
  background: '#ffffff',
  description: '#4b5563',
  pillBackground: '#eef2ff',
  pillBorder: '#c7d2fe',
  title: '#111827',
};

export interface Card {
  description: string | undefined;
  labels: string[];
  title: string;
}

interface CardAssets {
  fonts: Font[];
  logo: string;
}

let assets: Promise<CardAssets> | undefined;

async function loadAssets(): Promise<CardAssets> {
  await initWasm(
    await fs.readFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm')),
  );

  const [regular, bold, logo] = await Promise.all([
    fs.readFile(
      require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff'),
    ),
    fs.readFile(
      require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff'),
    ),
    fs.readFile(path.join(__dirname, '../../static/img/logo.svg'), 'base64'),
  ]);

  return {
    fonts: [
      { data: regular, name: 'Inter', weight: 400 },
      { data: bold, name: 'Inter', weight: 700 },
    ],
    logo: `data:image/svg+xml;base64,${logo}`,
  };
}

// Satori only lays out elements that explicitly opt into flex.
function div(style: CSSProperties, ...children: ReactNode[]): ReactElement {
  return createElement(
    'div',
    { style: { display: 'flex', ...style } },
    ...children,
  );
}

// Inter has no emoji glyphs, so any emoji left in the text renders as tofu.
function stripEmoji(text: string): string {
  return text
    .replaceAll(/\p{Extended_Pictographic}|\u200D|\uFE0F/gu, '')
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/ ([!,.:;?])/g, '$1')
    .trim();
}

function getTitleFontSize(title: string): number {
  if (title.length > 32) {
    return 56;
  }

  return title.length > 24 ? 66 : 76;
}

export async function renderCard({
  description,
  labels,
  title,
}: Card): Promise<Buffer> {
  const { fonts, logo } = await (assets ??= loadAssets());
  const cardTitle = stripEmoji(title);

  const svg = await satori(
    div(
      {
        backgroundColor: colors.background,
        flexDirection: 'column',
        fontFamily: 'Inter',
        height: cardHeight,
        width: cardWidth,
      },
      div({
        background: `linear-gradient(90deg, ${colors.accent}, #3535e5, #7035e5)`,
        height: 16,
      }),
      div(
        {
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
        },
        div(
          { alignItems: 'center', gap: 24 },
          createElement('img', { height: 72, src: logo, width: 72 }),
          div(
            { color: colors.title, fontSize: 36, fontWeight: 700 },
            'typescript-eslint',
          ),
        ),
        div(
          { flexDirection: 'column', overflow: 'hidden' },
          div(
            {
              color: colors.title,
              fontSize: getTitleFontSize(cardTitle),
              fontWeight: 700,
              letterSpacing: -1,
            },
            cardTitle,
          ),
          description &&
            div(
              {
                color: colors.description,
                fontSize: 32,
                lineHeight: 1.4,
                marginTop: 20,
              },
              stripEmoji(description),
            ),
        ),
        div(
          { alignItems: 'center', gap: 16 },
          ...labels.map(label =>
            div(
              {
                backgroundColor: colors.pillBackground,
                border: `2px solid ${colors.pillBorder}`,
                borderRadius: 999,
                color: colors.accent,
                fontSize: 26,
                fontWeight: 700,
                padding: '8px 24px',
              },
              label,
            ),
          ),
          div(
            {
              color: colors.description,
              fontSize: 28,
              marginLeft: 'auto',
            },
            'typescript-eslint.io',
          ),
        ),
      ),
    ),
    { fonts, height: cardHeight, width: cardWidth },
  );

  return Buffer.from(new Resvg(svg).render().asPng());
}
