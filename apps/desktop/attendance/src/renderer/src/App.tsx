import { Button } from "@sora-vp/ui/button";

function App(): JSX.Element {
  return (
    <>
      <p className="text-5xl font-bold">Test</p>
      <Button onClick={() => console.log("Go somewhere, do something.")}>
        Test
      </Button>
    </>
  );
}

export default App;
