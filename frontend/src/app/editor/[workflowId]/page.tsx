import { WorkflowEditor } from "@/components/editor/WorkflowEditor";

export default async function EditorPage({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = await params;
  return <WorkflowEditor workflowId={workflowId} />;
}
