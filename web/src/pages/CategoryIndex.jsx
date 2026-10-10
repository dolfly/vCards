import { data } from '../lib/data'
import CategoryCard from '../components/CategoryCard'

export default function CategoryIndex() {
  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page__title">行业分类</h1>
        <p className="page__lead">{data.categories.length} 个行业 · {data.total} 个企业与机构，点击分类查看收录详情。</p>
      </div>
      <div className="category-grid">
        {data.categories.map((c) => (
          <CategoryCard key={c.name} category={c} />
        ))}
      </div>
    </section>
  )
}