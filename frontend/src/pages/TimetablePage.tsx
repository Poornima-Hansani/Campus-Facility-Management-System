import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const TimetablePage = () => {
  return (
    <Layout>
      <PageHeader
        title="Timetable"
        subtitle="Manage student timetable sessions"
      />
      <EmptyState
        title="Timetable page ready"
        description="Next we will add timetable form, cards, and validation."
      />
    </Layout>
  );
};

export default TimetablePage;