import { CreateTripForm } from "@/components/forms/CreateTripForm";

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pt-24 pb-12">
      <h1 className="mb-6 text-xl font-semibold text-white">分享你的旅行灵感</h1>
      <CreateTripForm />
    </main>
  );
}
