import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:5000/api/message")
      .then((res) => res.json())
      .then((data: { message: string }) => {
        setMessage(data.message);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>TypeScript Frontend Connected</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;