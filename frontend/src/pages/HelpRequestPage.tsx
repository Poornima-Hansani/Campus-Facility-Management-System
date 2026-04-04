import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const HelpRequestPage = () => {
  return (
    <Layout>
      <PageHeader
        title="Help Requests"
        subtitle="Request help from lecturers, instructors, or senior students"
      />
      <EmptyState
        title="Help Request page ready"
        description="Next we will add request form, request list, and validations."
      />
    </Layout>
  );
};

export default HelpRequestPage;