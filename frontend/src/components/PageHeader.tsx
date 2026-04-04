type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

export default PageHeader;