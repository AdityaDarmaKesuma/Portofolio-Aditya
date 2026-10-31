import data from '@/data/portfolio.json';
import Portfolio from '@/components/Portfolio';

export default function Page() {
  return <Portfolio initialData={data} />;
}
