import { WorkflowEditor } from "@/components/editor/WorkflowEditor";

export default async function EditorPage({ params, searchParams }: { params: Promise<{ workflowId: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { workflowId } = await params;
  const { tab } = await searchParams;
  return <WorkflowEditor workflowId={workflowId} initialTab={tab === "review" ? "review" : "inspector"} />;
}
