import AssignmentExamPage from "./src/pages/AssignmentExamPage";

function App() {
<<<<<<< HEAD
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:3000/api/message")
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
=======
  return <AssignmentExamPage />;
>>>>>>> main
}

export default App;