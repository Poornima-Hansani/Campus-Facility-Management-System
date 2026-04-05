import React, { useEffect, useState } from 'react';
import api from '../api'; // your axios instance

const StudentFreeTime = () => {
  const [freeTimes, setFreeTimes] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFreeTime = async () => {
      try {
        const res = await api.get(`/api/students/free-time/${user._id}`);
        setFreeTimes(res.data.freeTime);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFreeTime();
  }, [user._id]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Free Time</h2>

      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Free From</th>
            <th>Free To</th>
          </tr>
        </thead>
        <tbody>
          {freeTimes.length === 0 ? (
            <tr>
              <td colSpan="3">No free time available</td>
            </tr>
          ) : (
            freeTimes.map((slot, index) => (
              <tr key={index}>
                <td>{slot.day}</td>
                <td>{slot.from}</td>
                <td>{slot.to}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentFreeTime;