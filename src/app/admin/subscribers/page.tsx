import { getAllSubscribers } from "@/queries/subscribers";

export default async function AdminSubscribersPage() {
  const subscribers = await getAllSubscribers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email subscribers collected from the public subscribe endpoint.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {subscribers.length > 0 ? (
          subscribers.map((subscriber) => (
            <div key={subscriber.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
              <div>
                <p className="font-medium">{subscriber.email}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(subscriber.subscribed_at).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {subscriber.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
