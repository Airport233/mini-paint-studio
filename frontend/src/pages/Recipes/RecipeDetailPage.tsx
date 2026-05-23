import { useParams } from 'react-router-dom';

export default function RecipeDetailPage() {
  const { id } = useParams();
  return (
    <div className="page">
      <h1>配方详情</h1>
      <p className="subtitle">配方 #{id}</p>
    </div>
  );
}
