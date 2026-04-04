import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const StudyGoalsPage = () => {
  return (
    <Layout>
      <PageHeader
        title="Study Goals"
        subtitle="Track daily, weekly, and monthly targets"
      />
      <EmptyState
        title="Study Goals page ready"
        description="Next we will add goal cards, progress bars, and validation."
      />
    </Layout>
  );
};

export default StudyGoalsPage;