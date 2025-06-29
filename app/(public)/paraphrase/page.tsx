import ParaphraserTool from "@/components/paraphraser-tool";

export default function ParaphrasePage() {
  return (
    <div className="max-w-3xl mx-auto px-2 py-4">
      <h1 className="text-2xl font-bold mb-3 text-center">AI Paraphrasing Tool</h1>
      <div className="bg-card/80 border border-border rounded-2xl shadow-lg p-2 sm:p-4">
        <ParaphraserTool />
      </div>
    </div>
  );
} 