import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import './index.scss'

type Website = 'acolead' | 'coalitionify'

const getWebsiteCounts = async (website: Website) => {
  const payload = await getPayload({ config: configPromise })
  const [total, published, drafts] = await Promise.all([
    payload.count({ collection: 'posts', where: { website: { equals: website } } }),
    payload.count({
      collection: 'posts',
      where: { and: [{ website: { equals: website } }, { _status: { equals: 'published' } }] },
    }),
    payload.count({
      collection: 'posts',
      where: { and: [{ website: { equals: website } }, { _status: { equals: 'draft' } }] },
    }),
  ])

  return {
    total: total.totalDocs,
    published: published.totalDocs,
    drafts: drafts.totalDocs,
  }
}

const PostsFolders = async () => {
  const [acolead, coalitionify] = await Promise.all([
    getWebsiteCounts('acolead'),
    getWebsiteCounts('coalitionify'),
  ])

  const folders = [
    { key: 'acolead', label: 'Acolead', color: '#3b82f6', counts: acolead },
    { key: 'coalitionify', label: 'Coalitionify', color: '#8b5cf6', counts: coalitionify },
  ] as const

  return (
    <section className="posts-folders" aria-labelledby="posts-folders-title">
      <div className="posts-folders__intro">
        <h2 className="posts-folders__title" id="posts-folders-title">
          Choose a website
        </h2>
        <p className="posts-folders__description">
          Select a website to manage its posts.
        </p>
      </div>

      <div className="posts-folders__grid">
        {folders.map(({ key, label, color, counts }) => (
          <a
            className="posts-folders__card"
            href={`/admin/collections/posts?where%5Bwebsite%5D%5Bequals%5D=${key}`}
            key={key}
          >
            <span className="posts-folders__icon" style={{ '--folder-color': color } as React.CSSProperties} />
            <span className="posts-folders__content">
              <span className="posts-folders__name">{label}</span>
              <span className="posts-folders__caption">Manage posts for {label} website</span>
              <span className="posts-folders__stats">
                <strong>{counts.total}</strong> Total Posts
                <span className="posts-folders__status posts-folders__status--published">
                  <i /> {counts.published} Published
                </span>
                <span className="posts-folders__status posts-folders__status--drafts">
                  <i /> {counts.drafts} Drafts
                </span>
              </span>
            </span>
            <span className="posts-folders__arrow" aria-hidden="true">
              &rarr;
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default PostsFolders