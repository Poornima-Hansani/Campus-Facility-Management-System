import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

type LectureItem = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: "Lecture Hall" | "Laboratory";
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

const lectureData: LectureItem[] = [
  {
    id: 1,
    moduleCode: "IT3040",
    moduleName: "Project Management",
    venueType: "Lecture Hall",
    venueName: "LH-201",
    lecturer: "Dr. Perera",
    day: "Monday",
    startTime: "08:00",
    endTime: "10:00",
  },
  {
    id: 2,
    moduleCode: "IT3050",
    moduleName: "Software Engineering",
    venueType: "Laboratory",
    venueName: "Lab A",
    lecturer: "Mr. Silva",
    day: "Wednesday",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    id: 3,
    moduleCode: "IT3060",
    moduleName: "Database Systems",
    venueType: "Lecture Hall",
    venueName: "LH-105",
    lecturer: "Ms. Fernando",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "12:00",
  },
  {
    id: 4,
    moduleCode: "IT3070",
    moduleName: "Information Security",
    venueType: "Laboratory",
    venueName: "Lab C",
    lecturer: "Dr. Nirmala",
    day: "Thursday",
    startTime: "09:00",
    endTime: "11:00",
  },
  {
    id: 5,
    moduleCode: "IT3080",
    moduleName: "Human Computer Interaction",
    venueType: "Lecture Hall",
    venueName: "LH-302",
    lecturer: "Mr. Jayasinghe",
    day: "Friday",
    startTime: "11:00",
    endTime: "13:00",
  },
  {
    id: 6,
    moduleCode: "IT3090",
    moduleName: "Data Analytics",
    venueType: "Laboratory",
    venueName: "Lab B",
    lecturer: "Ms. Wickrama",
    day: "Saturday",
    startTime: "08:30",
    endTime: "10:30",
  },
];

const dayOptions = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const LectureAvailabilityPage = () => {
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [day, setDay] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [reminders, setReminders] = useState<number[]>([]);

  const filteredResults = useMemo(() => {
    const codeValue = moduleCode.trim().toUpperCase();
    const nameValue = moduleName.trim().toLowerCase();

    return lectureData.filter((item) => {
      const codeMatch = codeValue
        ? item.moduleCode.toUpperCase().includes(codeValue)
        : true;

      const nameMatch = nameValue
        ? item.moduleName.toLowerCase().includes(nameValue)
        : true;

      const dayMatch = day ? item.day === day : true;

      return codeMatch && nameMatch && dayMatch;
    });
  }, [moduleCode, moduleName, day]);

  const validateSearch = () => {
    const cleanCode = moduleCode.trim().toUpperCase();
    const cleanName = moduleName.trim();

    if (!cleanCode && !cleanName && !day) {
      return "Enter a module code, module name, or select a day.";
    }

    if (cleanCode && !/^[A-Z]{2,4}\d{3,4}$/.test(cleanCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanName && cleanName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    return "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = validateSearch();

    if (validationMessage) {
      setError(validationMessage);
      setSearched(false);
      return;
    }

    setError("");
    setSearched(true);
  };

  const handleClear = () => {
    setModuleCode("");
    setModuleName("");
    setDay("");
    setError("");
    setSearched(false);
  };

  const toggleReminder = (id: number) => {
    setReminders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Lecture Availability"
        subtitle="Search lecture halls and laboratories by module code, module name, or day"
      />

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Search Lecture and Lab Availability</h3>
            <p>
              Students can filter available academic sessions and set reminders
              for important lectures or labs.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-group">
              <label>Module Code</label>
              <input
                type="text"
                placeholder="e.g. IT3040"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label>Module Name</label>
              <input
                type="text"
                placeholder="e.g. Project Management"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Day</label>
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {dayOptions.map((item) => (
                  <option key={item || "all"} value={item}>
                    {item || "All Days"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Search Availability
            </button>
            <button
              type="button"
              className="secondary-form-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="stats-grid availability-stats">
        <div className="stat-card">
          <h4>Total Sessions</h4>
          <h2>{searched ? filteredResults.length : lectureData.length}</h2>
          <p>Available lecture and lab records</p>
        </div>
        <div className="stat-card">
          <h4>Lecture Halls</h4>
          <h2>
            {(searched ? filteredResults : lectureData).filter(
              (item) => item.venueType === "Lecture Hall"
            ).length}
          </h2>
          <p>Lecture-based academic sessions</p>
        </div>
        <div className="stat-card">
          <h4>Laboratories</h4>
          <h2>
            {(searched ? filteredResults : lectureData).filter(
              (item) => item.venueType === "Laboratory"
            ).length}
          </h2>
          <p>Practical and lab sessions</p>
        </div>
        <div className="stat-card">
          <h4>Reminders Set</h4>
          <h2>{reminders.length}</h2>
          <p>Saved lecture and lab reminders</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Availability Results</h3>
            <p>
              Matching lecture halls and lab sessions based on the selected
              filters.
            </p>
          </div>
        </div>

        {!searched ? (
          <div className="empty-state">
            <h3>Search to view availability</h3>
            <p>
              Use module code, module name, or day filters to find academic
              sessions.
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <h3>No matching sessions found</h3>
            <p>Try another module code, name, or day.</p>
          </div>
        ) : (
          <div className="availability-results">
            {filteredResults.map((item) => {
              const hasReminder = reminders.includes(item.id);

              return (
                <div key={item.id} className="availability-card">
                  <div className="availability-top">
                    <div>
                      <span className="availability-badge">
                        {item.venueType}
                      </span>
                      <h4>
                        {item.moduleCode} - {item.moduleName}
                      </h4>
                    </div>
                  </div>

                  <div className="availability-details">
                    <p>
                      <strong>Venue:</strong> {item.venueName}
                    </p>
                    <p>
                      <strong>Lecturer:</strong> {item.lecturer}
                    </p>
                    <p>
                      <strong>Day:</strong> {item.day}
                    </p>
                    <p>
                      <strong>Time:</strong> {item.startTime} - {item.endTime}
                    </p>
                  </div>

                  <div className="availability-actions">
                    <button
                      className={
                        hasReminder
                          ? "secondary-form-btn reminder-active"
                          : "primary-form-btn"
                      }
                      onClick={() => toggleReminder(item.id)}
                    >
                      {hasReminder ? "Remove Reminder" : "Set Reminder"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LectureAvailabilityPage;