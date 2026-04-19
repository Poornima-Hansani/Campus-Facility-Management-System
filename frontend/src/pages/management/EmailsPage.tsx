import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiDelete, apiGet, apiPost } from "../../lib/api";
import { Mail } from "lucide-react";

type EmailItem = {
  id: number;
  studentId: string;
  studentEmail: string;
  moduleCode: string;
  moduleName: string;
  subject: string;
  message: string;
  sentDate: string;
  status: "Sent";
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    moduleCode: "",
    moduleName: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<EmailItem[]>("/api/management/emails")
      .then(data => setEmails(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.studentId || !formData.studentEmail || !formData.moduleCode) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await apiPost("/api/management/emails", {
        studentId: formData.studentId.trim().toUpperCase(),
        studentEmail: formData.studentEmail.trim(),
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      
      const updated = await apiGet<EmailItem[]>("/api/management/emails");
      setEmails(updated);
      setFormData({ studentId: "", studentEmail: "", moduleCode: "", moduleName: "", subject: "", message: "" });
      setSuccess("Email recorded successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/management/emails/${id}`);
      setEmails(emails.filter(e => e.id !== id));
      setSuccess("Email record removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record");
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Mail className="text-green-600" size={24} />
          </div>
          Encouragement Emails
        </h2>
        <p className="text-gray-500 text-sm mt-1">Record encouragement emails to repeat students</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold mb-4">Send Encouragement Email</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. IT23200001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Email *</label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              placeholder="e.g. student@my.sliit.lk"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Code *</label>
            <input
              type="text"
              name="moduleCode"
              value={formData.moduleCode}
              onChange={handleChange}
              placeholder="e.g. IT3040"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
            <input
              type="text"
              name="moduleName"
              value={formData.moduleName}
              onChange={handleChange}
              placeholder="e.g. Project Management"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter encouragement message"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}
          {success && <p className="text-green-500 text-sm col-span-2">{success}</p>}
          <div className="col-span-2 flex gap-4">
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Record Email
            </button>
            <button type="button" onClick={() => setFormData({ studentId: "", studentEmail: "", moduleCode: "", moduleName: "", subject: "", message: "" })} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Email Records</h3>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No email records yet</div>
        ) : (
          <div className="space-y-4">
            {emails.map(email => (
              <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{email.subject}</h4>
                    <p className="text-sm text-gray-500">To: {email.studentEmail} ({email.studentId})</p>
                    <p className="text-sm text-gray-500">Module: {email.moduleCode} - {email.moduleName}</p>
                    <p className="text-xs text-gray-400 mt-2">{email.message}</p>
                  </div>
                  <button onClick={() => handleDelete(email.id)} className="text-red-500 hover:text-red-700 text-sm">
                    Delete
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Sent: {email.sentDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}