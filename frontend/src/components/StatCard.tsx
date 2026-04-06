type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
};

const StatCard = ({ title, value, subtitle }: StatCardProps) => {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

export default StatCard;