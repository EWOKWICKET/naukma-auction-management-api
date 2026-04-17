import app from "./app";

const PORT = 3000;

app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`Server is running on port ${PORT}`);
});