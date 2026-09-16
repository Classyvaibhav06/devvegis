const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// Palette Constants
const NAVY = '1B2A4A';
const ACCENT_BLUE = '2563EB';
const LIGHT_BLUE = '93C5FD';
const BOX_BLUE = 'EFF6FF';
const SCORE_GREEN = '16A34A';
const SCORE_AMBER = 'D97706';
const SCORE_RED = 'DC2626';
const PRIORITY_ORANGE = 'EA580C';
const TABLE_GRAY = 'F8F9FA';
const BORDER_GRAY = 'E2E8F0';
const TEXT_DARK = '1E293B';
const TEXT_MUTED = '64748B';
const SUCCESS_BG = 'F0FDF4';

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function createCell(content, width, shadingColor, isHeader = false, borders = cellBorders) {
  const paragraphs = Array.isArray(content) ? content : [
    new Paragraph({
      alignment: isHeader ? AlignmentType.LEFT : AlignmentType.LEFT,
      children: [
        new TextRun({
          text: String(content),
          bold: isHeader,
          size: isHeader ? 20 : 19,
          color: isHeader ? 'FFFFFF' : TEXT_DARK,
          font: 'Arial',
        }),
      ],
      spacing: { before: 80, after: 80 },
    })
  ];

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shadingColor ? { fill: shadingColor, type: ShadingType.CLEAR } : undefined,
    borders: borders,
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    verticalAlign: VerticalAlign.CENTER,
    children: paragraphs,
  });
}

function createStatusCell(status, width) {
  let bg = SCORE_RED;
  let text = status;
  if (status.toLowerCase().includes('good') || status.toLowerCase().includes('pass') || status.toLowerCase().includes('strong')) {
    bg = SCORE_GREEN;
  } else if (status.toLowerCase().includes('attention') || status.toLowerCase().includes('track') || status.toLowerCase().includes('partial')) {
    bg = SCORE_AMBER;
  }

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    borders: cellBorders,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: text,
            bold: true,
            size: 18,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { before: 40, after: 40 },
      }),
    ],
  });
}

function createPriorityCell(priority, width) {
  let bg = SCORE_RED;
  if (priority.includes('High')) bg = PRIORITY_ORANGE;
  else if (priority.includes('Medium')) bg = SCORE_AMBER;
  else if (priority.includes('Quick Win')) bg = SCORE_GREEN;

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    borders: cellBorders,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: priority,
            bold: true,
            size: 18,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { before: 40, after: 40 },
      }),
    ],
  });
}

// ──────────────── COVER PAGE ────────────────
const coverSection = {
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
    },
  },
  children: [
    // Top Spacer
    new Paragraph({
      spacing: { before: 2400, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [],
    }),
    // Domain Hero
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: "devvegis.com",
          bold: true,
          size: 72, // 36pt
          color: NAVY,
          font: 'Arial',
        }),
      ],
    }),
    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: "SEO / GEO / AEO Audit Report",
          bold: true,
          size: 36, // 18pt
          color: ACCENT_BLUE,
          font: 'Arial',
        }),
      ],
    }),
    // Audit Type Pill
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
      children: [
        new TextRun({
          text: "FULL AUDIT — COMPREHENSIVE PLATFORM EVALUATION",
          bold: true,
          size: 20, // 10pt
          color: TEXT_MUTED,
          font: 'Arial',
        }),
      ],
    }),

    // 3-Column Cover Score Table
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            // SEO Score Cell
            new TableCell({
              width: { size: 3120, type: WidthType.DXA },
              shading: { fill: SCORE_RED, type: ShadingType.CLEAR },
              margins: { top: 360, bottom: 360, left: 200, right: 200 },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "SEO", bold: true, size: 24, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "4/10", bold: true, size: 72, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Needs Work", italics: true, size: 20, color: 'FFFFFF', font: 'Arial' })],
                }),
              ],
            }),
            // GEO Score Cell
            new TableCell({
              width: { size: 3120, type: WidthType.DXA },
              shading: { fill: SCORE_RED, type: ShadingType.CLEAR },
              margins: { top: 360, bottom: 360, left: 200, right: 200 },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "GEO", bold: true, size: 24, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "4/10", bold: true, size: 72, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Needs Work", italics: true, size: 20, color: 'FFFFFF', font: 'Arial' })],
                }),
              ],
            }),
            // AEO Score Cell
            new TableCell({
              width: { size: 3120, type: WidthType.DXA },
              shading: { fill: SCORE_RED, type: ShadingType.CLEAR },
              margins: { top: 360, bottom: 360, left: 200, right: 200 },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "AEO", bold: true, size: 24, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "3/10", bold: true, size: 72, color: 'FFFFFF', font: 'Arial' })],
                  spacing: { after: 120 },
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Needs Work", italics: true, size: 20, color: 'FFFFFF', font: 'Arial' })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // Bottom Spacer & Attribution
    new Paragraph({
      spacing: { before: 2400, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Audit Date: September 17, 2026",
          size: 18,
          color: TEXT_MUTED,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Claude Skill and Plugin by Alex Labat",
          size: 18,
          color: TEXT_MUTED,
          font: 'Arial',
        }),
      ],
    }),
  ],
};

// ──────────────── HEADER & FOOTER ────────────────
const mainHeader = new Header({
  children: [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      borders: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY },
        top: noBorder, left: noBorder, right: noBorder
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: "devvegis.com", bold: true, size: 18, color: NAVY, font: 'Arial' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 4680, type: WidthType.DXA },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "SEO / GEO / AEO Audit Report", size: 18, color: TEXT_MUTED, font: 'Arial' })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

const mainFooter = new Footer({
  children: [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
        bottom: noBorder, left: noBorder, right: noBorder
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 6000, type: WidthType.DXA },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: "Claude Skill and Plugin by Alex Labat", size: 16, color: TEXT_MUTED, font: 'Arial' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 3360, type: WidthType.DXA },
              borders: noBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "Page ", size: 16, color: TEXT_MUTED, font: 'Arial' }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TEXT_MUTED, font: 'Arial' }),
                    new TextRun({ text: " of ", size: 16, color: TEXT_MUTED, font: 'Arial' }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: TEXT_MUTED, font: 'Arial' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

// Helper: Section Heading 1
function h1(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 180 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 38, // 19pt
        color: NAVY,
        font: 'Arial',
      })
    ]
  });
}

// Helper: Section Heading 2
function h2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28, // 14pt
        color: ACCENT_BLUE,
        font: 'Arial',
      })
    ]
  });
}

function p(text, boldPrefix = "") {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [
      boldPrefix ? new TextRun({ text: boldPrefix, bold: true, size: 21, color: TEXT_DARK, font: 'Arial' }) : null,
      new TextRun({ text: text, size: 21, color: TEXT_DARK, font: 'Arial' }),
    ].filter(Boolean)
  });
}

// ──────────────── MAIN REPORT BODY ────────────────
const bodyChildren = [
  // SECTION 1: EXECUTIVE SUMMARY
  h1("1. Executive Summary"),
  
  // Blue Callout Box
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT_BLUE },
      top: thinBorder, bottom: thinBorder, right: thinBorder
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BOX_BLUE, type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 240, right: 240 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 80 },
                children: [
                  new TextRun({
                    text: "DevVegis (devvegis.com) is an exceptionally modern, fast, and feature-rich hyper-local farm-to-kitchen e-commerce platform built on Next.js 15 and PostgreSQL. However, from a discoverability perspective, the site operates behind a severe search invisibility curtain. The lack of basic technical crawl assets (missing robots.txt and sitemap.xml), coupled with 10 persistent 404 broken links in the global footer and pure client-side rendering for its 184+ product catalog, severely suppresses organic rankings. While the B2B Wholesale and AI Freshness engines provide stellar factual depth for AI synthesis engines (GEO), zero Schema.org structured data, missing canonical tags, and absent E-E-A-T trust signals (founder bio, verified FSSAI certification, and dedicated About/Contact pages) prevent search and answer engines from citing the platform. Resolving these core infrastructure gaps will immediately unlock significant search equity.",
                    size: 21,
                    color: TEXT_DARK,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({ spacing: { before: 180, after: 80 } }),

  // Executive Scores Table
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      // Header
      new TableRow({
        children: [
          createCell("Dimension", 1600, NAVY, true),
          createCell("Score", 1200, NAVY, true),
          createCell("Status", 1600, NAVY, true),
          createCell("Key Strategic Takeaway", 4960, NAVY, true),
        ],
      }),
      // SEO Row
      new TableRow({
        children: [
          createCell("SEO", 1600, 'FFFFFF', true),
          createStatusCell("4/10", 1200),
          createStatusCell("Needs Work", 1600),
          createCell("Missing robots.txt/sitemap, 10 internal 404 links, title duplication on 184 products.", 4960, 'FFFFFF'),
        ],
      }),
      // GEO Row
      new TableRow({
        children: [
          createCell("GEO", 1600, TABLE_GRAY, true),
          createStatusCell("4/10", 1200),
          createStatusCell("Needs Work", 1600),
          createCell("Rich Mandi & cold-chain facts, but zero Knowledge Graph entities and no About/E-E-A-T signals.", 4960, TABLE_GRAY),
        ],
      }),
      // AEO Row
      new TableRow({
        children: [
          createCell("AEO", 1600, 'FFFFFF', true),
          createStatusCell("3/10", 1200),
          createStatusCell("Needs Work", 1600),
          createCell("No direct-answer snippet blocks, zero FAQ/Recipe schema, interactive tools hidden in client state.", 4960, 'FFFFFF'),
        ],
      }),
      // Total Row
      new TableRow({
        children: [
          createCell("Combined", 1600, BOX_BLUE, true),
          createCell("11/30", 1200, BOX_BLUE, true),
          createCell("Critical Deficit", 1600, BOX_BLUE, true),
          createCell("Foundation is architecturally pristine; immediate SEO/GEO layer implementation will trigger dramatic rank gains.", 4960, BOX_BLUE),
        ],
      }),
    ],
  }),

  new Paragraph({ spacing: { before: 200, after: 100 } }),

  // SECTION 2: PAGES AUDITED
  h1("2. Pages Audited & Platform Scope"),
  p("A comprehensive crawl and architectural source inspection was conducted across all core public interfaces, dynamic template categories, and catalog assets on devvegis.com:"),
  
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("URL / Route", 3200, NAVY, true),
          createCell("Page Type", 1800, NAVY, true),
          createCell("Audit Observations & Signals Detected", 4360, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("https://devvegis.com/", 3200, 'FFFFFF'),
          createCell("Store Homepage", 1800, 'FFFFFF'),
          createCell("SSR root layout loaded. Title template appended. H1 is generic promo text. No JSON-LD schema.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("/categories/[slug] (8 Categories)", 3200, TABLE_GRAY),
          createCell("Category Archive", 1800, TABLE_GRAY),
          createCell("Client component ('use client'). Inherits default root title. Zero CollectionPage or ItemList schema.", 4360, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createCell("/products/[slug] (184 Items)", 3200, 'FFFFFF'),
          createCell("Product Detail Page", 1800, 'FFFFFF'),
          createCell("Client rendered. Title is duplicated root title across all 184 items. Zero Product schema or price currency.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("/wholesale", 3200, TABLE_GRAY),
          createCell("B2B Trading Floor", 1800, TABLE_GRAY),
          createCell("Exceptional factual density (APMC Mandi spot rates, HSN codes, reefer telemetry). Client component.", 4360, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createCell("/ai-recipe", 3200, 'FFFFFF'),
          createCell("AI Recipe Studio", 1800, 'FFFFFF'),
          createCell("Great conversational intent (H1 'What can I cook?'). Missing Recipe & HowTo schema markup.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("/ai-freshness", 3200, TABLE_GRAY),
          createCell("AI Inspection Lab", 1800, TABLE_GRAY),
          createCell("Detailed shelf-life & vitamin storage facts. Interactive state unindexable by traditional search bots.", 4360, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createCell("/search", 3200, 'FFFFFF'),
          createCell("Catalog Search", 1800, 'FFFFFF'),
          createCell("Dynamic query search. No noindex directive for thin search result parameter variations.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("/cart & /checkout", 3200, TABLE_GRAY),
          createCell("Transactional Funnel", 1800, TABLE_GRAY),
          createCell("Clean checkout flow. Needs explicit noindex,nofollow directives to protect crawl budget.", 4360, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createCell("/rider", 3200, 'FFFFFF'),
          createCell("Rider Dispatch", 1800, 'FFFFFF'),
          createCell("Operational logistics portal. Should be gated or set to noindex.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("/robots.txt", 3200, TABLE_GRAY),
          createCell("Crawl Directive", 1800, TABLE_GRAY),
          createCell("CRITICAL: Returns HTTP 404 Not Found. Search bots have no guidance on disallowed routes.", 4360, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createCell("/sitemap.xml", 3200, 'FFFFFF'),
          createCell("XML Index Map", 1800, 'FFFFFF'),
          createCell("CRITICAL: Returns HTTP 404 Not Found. Search engines cannot auto-discover 184 product URLs.", 4360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("10 Footer Legal/Info Pages", 3200, TABLE_GRAY),
          createCell("Trust & Corporate", 1800, TABLE_GRAY),
          createCell("CRITICAL: /about, /quality, /careers, /press, /help, /refunds, /contact, /privacy, /terms, /food-safety all 404!", 4360, TABLE_GRAY),
        ],
      }),
    ],
  }),

  // SECTION 3: SEO ANALYSIS
  h1("3. SEO Analysis (Traditional Search Optimization) — Score: 4/10"),
  p("Traditional search engine optimization evaluates technical crawlability, indexation hygiene, on-page content relevance, metadata integrity, and structured data."),

  h2("3.1 Technical On-Page Signals"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("Signal", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Title Tags", 2400, 'FFFFFF', true),
          createCell("Root title is configured ('DevVegis — Farm-Fresh Organic Grocery in 12 Minutes | DevVegis'). However, dynamic product and category pages lack generateMetadata, causing all 184 products and 8 categories to share the identical default title.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Meta Descriptions", 2400, TABLE_GRAY, true),
          createCell("Root description exists (122 characters; below 150-160 char target). Inner product and category pages inherit the generic root description without specific pricing, weight, or local Bangalore delivery CTAs.", 5360, TABLE_GRAY),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Heading Hierarchy", 2400, 'FFFFFF', true),
          createCell("Homepage H1 is 'Don\'t miss amazing grocery deals.' — weak marketing text lacking target keywords ('Farm-Fresh Vegetables Delivery Bangalore'). Product H1s are client-side only and empty in SSR HTML.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Robots.txt", 2400, TABLE_GRAY, true),
          createCell("Missing file! HTTP 404 returned on /robots.txt. Search engine and AI bots (Googlebot, GPTBot, PerplexityBot) encounter no crawl directives or sitemap pointers.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("XML Sitemap", 2400, 'FFFFFF', true),
          createCell("Missing file! HTTP 404 returned on /sitemap.xml. No automated feed exists to submit 184 product URLs, 8 categories, and static pages to Google Search Console.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Canonical Tags", 2400, TABLE_GRAY, true),
          createCell("No explicit rel='canonical' tag rendered. metadataBase is defined in layout, but alternates.canonical is not declared, risking duplicate content between search parameters.", 5360, TABLE_GRAY),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Broken Internal Links", 2400, 'FFFFFF', true),
          createCell("Severe issue: 10 links in the site-wide footer point to non-existent routes (/about, /contact, /quality, /careers, /press, /help, /refunds, /privacy, /terms, /food-safety). All return HTTP 404.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Open Graph / Twitter", 2400, TABLE_GRAY, true),
          createCell("og:title, og:description, and twitter:card are defined in layout.tsx. However, og:image and twitter:image are completely missing, resulting in blank link previews on WhatsApp, X, and LinkedIn.", 5360, TABLE_GRAY),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Mobile & Viewport", 2400, 'FFFFFF', true),
          createCell("Viewport properly configured (width=device-width, initialScale=1). Responsive mobile design and dark mode switching work seamlessly.", 5360, 'FFFFFF'),
          createStatusCell("Good", 1600),
        ],
      }),
    ],
  }),

  h2("3.2 Content Quality & Architecture"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("Signal", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Product Descriptions", 2400, 'FFFFFF', true),
          createCell("Many products in the database have null or generic descriptions. Lack of culinary usage tips, origin details, and storage instructions weakens keyword breadth.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Pillar / Blog Content", 2400, TABLE_GRAY, true),
          createCell("No educational blog, seasonal harvest calendar, or nutrition guide section exists (0 pillar articles). Limits organic discovery to direct transactional product queries.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Visual Merchandising Alt Text", 2400, 'FFFFFF', true),
          createCell("Product cards utilize next/image with dynamic alt={product.name}. Secondary promo banners rely on static generic alt text.", 5360, 'FFFFFF'),
          createStatusCell("Good", 1600),
        ],
      }),
    ],
  }),

  h2("3.3 Structured Data (Schema.org)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("Schema Type", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Organization Schema", 2400, 'FFFFFF', true),
          createCell("Completely absent. No JSON-LD declaring brand name, legal entity, logo URL, or official social links.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("LocalBusiness / Store", 2400, TABLE_GRAY, true),
          createCell("Completely absent. Indiranagar dark store address, phone hotline, and opening hours are not declared in structured schema.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Product Schema", 2400, 'FFFFFF', true),
          createCell("Completely absent on all 184 product pages. No Offer schema with price, priceCurrency (INR), availability, or aggregateRating.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("BreadcrumbList Schema", 2400, TABLE_GRAY, true),
          createCell("Breadcrumb HTML visual UI exists on product pages (Home / Category / Product), but lacks Schema.org JSON-LD markup.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
    ],
  }),

  // SECTION 4: GEO ANALYSIS
  h1("4. GEO Analysis (Generative Engine Optimization) — Score: 4/10"),
  p("Generative Engine Optimization measures how effectively AI synthesis engines (ChatGPT Search, Perplexity, Gemini, Google AI Overviews) can cite, extract facts from, and verify the authority of devvegis.com."),

  h2("4.1 E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("GEO Signal", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Brand Entity Clarity", 2400, 'FFFFFF', true),
          createCell("Brand is consistently named 'DevVegis' and 'DevVegis Technologies Pvt. Ltd.'. However, without sameAs links pointing to Wikidata, LinkedIn, Crunchbase, or MCA company registry, AI knowledge graphs cannot anchor the entity.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("About & Founder Signals", 2400, TABLE_GRAY, true),
          createCell("Missing entirely! /about returns 404. There is no mention of founders, agricultural scientists, sourcing directors, or company history for AI crawlers to summarize.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("NAP Data (Name/Address/Phone)", 2400, 'FFFFFF', true),
          createCell("Footer includes full physical dark store address ('Indiranagar Central Dark Store, Bengaluru, KA 560038'), 1800 hotline, and email. However, dedicated /contact page returns 404.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Regulatory Trust (FSSAI)", 2400, TABLE_GRAY, true),
          createCell("Footer links to '/food-safety' for FSSAI compliance, but the page returns 404. No 14-digit FSSAI license number is displayed on the site, weakening AI trust verification.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
    ],
  }),

  h2("4.2 Content for AI Synthesis & Citing"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("GEO Signal", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Factual Density (Wholesale)", 2400, 'FFFFFF', true),
          createCell("Exemplary. Real-time APMC Mandi modal prices (Nashik Onions, Indore Potatoes, Kolar Tomatoes), HSN codes, arrivals volume, and 3.8°C reefer telemetry offer rich citable facts for B2B procurement queries.", 5360, 'FFFFFF'),
          createStatusCell("Good", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Sourcing Provenance Proof", 2400, TABLE_GRAY, true),
          createCell("Product origins are tagged in the database ('Himachal Pradesh', 'Rajasthan', 'Lasalgaon Mandi'), but individual consumer product pages do not display farm cluster background or certification proof.", 5360, TABLE_GRAY),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Crawlability for AI Bots", 2400, 'FFFFFF', true),
          createCell("Client-side dynamic fetching via TanStack Query and interactive state renders content client-side. AI bots fetching raw HTML without headless JS rendering miss all product cards and prices.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
    ],
  }),

  // SECTION 5: AEO ANALYSIS
  h1("5. AEO Analysis (Answer Engine Optimization) — Score: 3/10"),
  p("Answer Engine Optimization evaluates readiness for Google Featured Snippets, 'People Also Ask' accordions, voice search assistants (Google Assistant, Siri, Alexa), and Perplexity/ChatGPT instant answer cards."),

  h2("5.1 Featured Snippet & Direct Answer Eligibility"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("AEO Signal", 2400, NAVY, true),
          createCell("Observed Implementation & Audit Findings", 5360, NAVY, true),
          createCell("Status", 1600, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Direct Answer Paragraphs", 2400, 'FFFFFF', true),
          createCell("The site has zero 40-60 word concise direct-answer blocks beneath question headings. Queries like 'How fast does DevVegis deliver?' or 'What is Mandi wholesale pricing?' are nowhere concisely summarized.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Definition Sentences", 2400, TABLE_GRAY, true),
          createCell("No declarative definition sentence exists (e.g., 'DevVegis is a quick-commerce grocery platform in Bangalore delivering produce in 12 minutes'). Without this, snippet extractors cannot define the service.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("FAQ Schema Markup", 2400, 'FFFFFF', true),
          createCell("Completely absent. No FAQPage schema markup exists anywhere on the site. Customer Care links in the footer (/help, /refunds) return 404.", 5360, 'FFFFFF'),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Recipe / HowTo Schema", 2400, TABLE_GRAY, true),
          createCell("The /ai-recipe page generates step-by-step culinary instructions, cooking time, calories, and required produce — ideal for Google Recipe rich snippets. However, zero Recipe schema is rendered.", 5360, TABLE_GRAY),
          createStatusCell("Missing", 1600),
        ],
      }),
      new TableRow({
        children: [
          createCell("Voice Search Natural Phrasing", 2400, 'FFFFFF', true),
          createCell("H1 on /ai-recipe ('What can I cook with my fresh produce?') uses natural voice phrasing. However, the output is hidden in client-side React state and not indexed in raw HTML.", 5360, 'FFFFFF'),
          createStatusCell("Needs Attention", 1600),
        ],
      }),
    ],
  }),

  // SECTION 6: PRIORITY RECOMMENDATIONS MATRIX
  h1("6. Priority Recommendations Matrix"),
  p("A prioritized implementation roadmap organized by business impact, technical effort, and search dimension:"),

  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("Priority", 1500, NAVY, true),
          createCell("Issue & Strategic Remediation Plan", 4660, NAVY, true),
          createCell("Dim.", 1000, NAVY, true),
          createCell("Effort", 1100, NAVY, true),
          createCell("Impact", 1100, NAVY, true),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🔴 Critical", 1500),
          createCell("Deploy robots.ts and dynamic sitemap.ts in client/app to auto-index 184 products and 8 categories, and remove the 404 crawl barrier.", 4660, 'FFFFFF'),
          createCell("SEO", 1000, 'FFFFFF'),
          createCell("Low", 1100, 'FFFFFF'),
          createCell("Highest", 1100, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🔴 Critical", 1500),
          createCell("Resolve 10 broken footer 404 links by creating static pages for /about, /contact, /privacy, /terms, /food-safety, and /help.", 4660, TABLE_GRAY),
          createCell("SEO/GEO", 1000, TABLE_GRAY),
          createCell("Medium", 1100, TABLE_GRAY),
          createCell("Highest", 1100, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🔴 Critical", 1500),
          createCell("Implement generateMetadata on /products/[slug] and /categories/[slug] to inject unique dynamic titles, descriptions, and canonical URLs.", 4660, 'FFFFFF'),
          createCell("SEO", 1000, 'FFFFFF'),
          createCell("Medium", 1100, 'FFFFFF'),
          createCell("High", 1100, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟠 High", 1500),
          createCell("Add Schema.org JSON-LD scripts: Organization, LocalBusiness (Indiranagar store), Product (184 items), and BreadcrumbList.", 4660, TABLE_GRAY),
          createCell("SEO/AEO", 1000, TABLE_GRAY),
          createCell("Medium", 1100, TABLE_GRAY),
          createCell("High", 1100, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟠 High", 1500),
          createCell("Publish FSSAI license verification and farm sourcing provenance credentials on /about and /food-safety to build E-E-A-T.", 4660, 'FFFFFF'),
          createCell("GEO", 1000, 'FFFFFF'),
          createCell("Low", 1100, 'FFFFFF'),
          createCell("High", 1100, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟡 Medium", 1500),
          createCell("Deploy FAQPage schema and structured 40-60 word direct-answer definition blocks on /wholesale, /about, and category archives.", 4660, TABLE_GRAY),
          createCell("AEO", 1000, TABLE_GRAY),
          createCell("Medium", 1100, TABLE_GRAY),
          createCell("Medium", 1100, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟡 Medium", 1500),
          createCell("Mark up AI Chef recipes on /ai-recipe with Schema.org/Recipe and HowTo structured data for Google Recipe carousel snippets.", 4660, 'FFFFFF'),
          createCell("AEO", 1000, 'FFFFFF'),
          createCell("Low", 1100, 'FFFFFF'),
          createCell("Medium", 1100, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟢 Quick Win", 1500),
          createCell("Add default og:image and twitter:image banners (1200x630px) in layout.tsx to fix blank social sharing cards on WhatsApp & X.", 4660, TABLE_GRAY),
          createCell("SEO", 1000, TABLE_GRAY),
          createCell("Lowest", 1100, TABLE_GRAY),
          createCell("Medium", 1100, TABLE_GRAY),
        ],
      }),
      new TableRow({
        children: [
          createPriorityCell("🟢 Quick Win", 1500),
          createCell("Rewrite Homepage H1 from 'Don\'t miss amazing grocery deals.' to 'DevVegis — Farm-Fresh Produce Delivered in 12 Minutes'.", 4660, 'FFFFFF'),
          createCell("SEO/AEO", 1000, 'FFFFFF'),
          createCell("Lowest", 1100, 'FFFFFF'),
          createCell("Medium", 1100, 'FFFFFF'),
        ],
      }),
    ],
  }),

  // SECTION 7: WHAT'S WORKING WELL
  h1("7. What's Working Well (Core Strengths)"),
  p("Despite technical search optimization deficits, DevVegis exhibits powerful differentiating capabilities that provide a formidable foundation for market dominance:"),

  new Table({
    width: { size: 9360, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          createCell("Differentiating Strength", 3000, SCORE_GREEN, true),
          createCell("Concrete Evidence Observed Across Platform", 6360, SCORE_GREEN, true),
        ],
      }),
      new TableRow({
        children: [
          createCell("Granular APMC Mandi Intelligence", 3000, SUCCESS_BG, true),
          createCell("The Wholesale portal incorporates real-time commodity spot rates from Lasalgaon, Indore, and Kolar, featuring HSN codes, arrivals volume, and dynamic volume pricing tiers that are unmatched in B2B quick-commerce.", 6360, SUCCESS_BG),
        ],
      }),
      new TableRow({
        children: [
          createCell("Cold-Chain Telemetry Transparency", 3000, 'FFFFFF', true),
          createCell("Publishing exact reefer container holding temperatures (3.8°C) and unbroken 4°C cold-chain arrival guarantees establishes superior factual authority for generative AI search engines.", 6360, 'FFFFFF'),
        ],
      }),
      new TableRow({
        children: [
          createCell("Innovative AI Functional Utilities", 3000, SUCCESS_BG, true),
          createCell("The AI Recipe Studio and AI Freshness Quality Inspector represent high-utility features with strong natural language search potential once properly exposed to search crawlers.", 6360, SUCCESS_BG),
        ],
      }),
      new TableRow({
        children: [
          createCell("Pristine UI Architecture & Speed", 3000, 'FFFFFF', true),
          createCell("Built on modern Next.js 15 with Tailwind CSS and TanStack Query. Instantaneous client navigation, dark mode support, and clean responsive layout ensure superior Core Web Vitals once SSR metadata is in place.", 6360, 'FFFFFF'),
        ],
      }),
    ],
  }),

  // SECTION 8: GLOSSARY
  h1("8. Strategic Glossary"),
  p("Search Engine Optimization (SEO): The discipline of enhancing technical website infrastructure, on-page content relevance, and link equity to maximize organic visibility and keyword rankings on search engines like Google and Bing.", "• "),
  p("Generative Engine Optimization (GEO): The optimization of digital assets for AI-powered synthesis engines (ChatGPT Search, Perplexity, Google AI Overviews, Gemini). GEO emphasizes E-E-A-T credibility, factual density, author verification, and knowledge graph anchoring.", "• "),
  p("Answer Engine Optimization (AEO): Formatting content to win zero-click search snippets, Google Featured Snippets, People Also Ask dropdowns, and conversational voice search responses through structured definitions and Schema.org markup.", "• "),
];

const mainSection = {
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
    },
  },
  headers: { default: mainHeader },
  footers: { default: mainFooter },
  children: bodyChildren,
};

const doc = new Document({
  sections: [coverSection, mainSection],
});

const outputPath = '/home/vaibhav/devvegis/seo-audit-devvegis-com-2026-09-17.docx';
const brainOutputPath = '/home/vaibhav/.gemini/antigravity-ide/brain/fbbdc0ee-aed4-4ad6-9f93-ff4cfd1dd391/seo-audit-devvegis-com-2026-09-17.docx';

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(brainOutputPath, buffer);
  console.log('DOCX written successfully to:', outputPath);
  console.log('DOCX copied to brain artifacts at:', brainOutputPath);
});
