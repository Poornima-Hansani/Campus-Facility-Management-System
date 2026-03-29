import { useState } from 'react';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

const LOCATIONS = [
  'Lecture Room L101', 'Lecture Room L102', 'Lecture Room L201', 'Lecture Room N101',
  'Main Canteen', 'Engineering Canteen',
  'Block A Washroom (Gnd Floor)', 'Block B Washroom (1st Floor)',
];

const ISSUE_TYPES = [
  'A/C Too High', 'A/C Too Low',
  'Screen Not Visible (Light Beam)', 
  'Cleanliness/Tidiness', 'Leftover Food/Trash',
  'Wet Floor', 'Water Leak', 'Broken Equipment'
];

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    location: '',
    issueType: '',
    comment: '',
    image: null as File | null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const isHygieneIssue = 
    formData.issueType.includes('Cleanliness') || 
    formData.issueType.includes('Leftover') ||
    formData.issueType.includes('Wet Floor') ||
    formData.location.includes('Washroom') ||
    formData.location.includes('Canteen');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.location) newErrors.location = 'Please select a location.';
    if (!formData.issueType) newErrors.issueType = 'Please select an issue type.';
    if (isHygieneIssue && !formData.image) {
      newErrors.image = 'An image is mandatory for hygiene/cleanliness related issues.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    
    try {
      // In a real app we'd upload the image as multipart/form-data. For presentation, we send mock JSON.
      const res = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: formData.location,
          issueType: formData.issueType,
          comment: formData.comment,
          hasImage: !!formData.image,
          studentId: 'STU12345' // Hardcoded for dummy login
        })
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ location: '', issueType: '', comment: '', image: null });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Failed to submit report. Please check if the backend is running.');
    }
  };

  const populateDummyData = () => {
    setFormData({
      location: 'Main Canteen',
      issueType: 'Leftover Food/Trash',
      comment: 'Empty plates left on table 5 by previous students.',
      image: new File([''], 'dummy-photo.jpg', { type: 'image/jpeg' })
    });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Report a Facility Issue</h2>
          <button 
            type="button" 
            onClick={populateDummyData}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors font-medium border border-white/30"
          >
            Populate Dummy Data
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {status === 'success' && (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center gap-3 border border-green-200">
              <CheckCircle2 className="text-green-600" />
              <p className="font-medium">Issue reported successfully! Thank you for keeping our campus clean.</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
              <select 
                className={`w-full p-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.location ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Select a location...</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              {errors.location && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14}/>{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Type *</label>
              <select 
                className={`w-full p-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.issueType ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.issueType}
                onChange={e => setFormData({...formData, issueType: e.target.value})}
              >
                <option value="">Select an issue...</option>
                {ISSUE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              {errors.issueType && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14}/>{errors.issueType}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Photo {isHygieneIssue ? '*' : '(Optional)'}</label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'}`}>
                <input 
                  type="file" 
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Camera size={32} className={formData.image ? 'text-emerald-500' : 'text-gray-400'} />
                  <span className="text-sm font-medium text-emerald-600">
                    {formData.image ? formData.image.name : 'Click to upload a photo'}
                  </span>
                  <span className="text-xs text-gray-500">Formats: JPG, PNG. Max: 5MB.</span>
                </label>
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14}/>{errors.image}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Comments (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Provide any additional details..."
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                value={formData.comment}
                onChange={e => setFormData({...formData, comment: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
