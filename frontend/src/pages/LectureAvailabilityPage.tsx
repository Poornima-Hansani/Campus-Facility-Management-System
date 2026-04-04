import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const LectureAvailabilityPage = () => {
  return (
    <Layout>
      <PageHeader
        title="Lecture Availability"
        subtitle="Search lecture halls and laboratories by module"
      />
      <EmptyState
        title="Lecture Availability page ready"
        description="Next we will build the search form and result cards."
      />
    </Layout>
  );
};

export default LectureAvailabilityPage;