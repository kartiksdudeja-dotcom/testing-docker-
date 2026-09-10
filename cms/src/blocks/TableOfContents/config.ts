import type { Block } from 'payload'

export const TableOfContents: Block = {
  slug: 'tableOfContents',
  interfaceName: 'TableOfContentsBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Table of Contents',
      admin: {
        description: 'The heading shown above the automatically generated table of contents.',
      },
    },
  ],
}
