import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const AssignmentExamPage = () => {
  return (
    <Layout>
      <PageHeader
        title="Assignments and Exams"
        subtitle="Track deadlines, exams, and academic alerts"
      />
      <EmptyState
        title="Assignment and Exam page ready"
        description="Next we will add forms, list cards, and alert sections."
      />
    </Layout>
  );
};

export default AssignmentExamPage;