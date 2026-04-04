import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const ManagementDashboard = () => {
  return (
    <Layout>
      <PageHeader
        title="Management Dashboard"
        subtitle="Monitor repeat student support and request activity"
      />
      <EmptyState
        title="Management Dashboard page ready"
        description="Next we will add charts, summaries, and repeat student email section."
      />
    </Layout>
  );
};

export default ManagementDashboard;