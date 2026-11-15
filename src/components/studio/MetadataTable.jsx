
import { ChevronRight } from "lucide-react";

function MetadataTable({ title, rows = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
      <div className="border-b border-base-300 px-5 py-4">
        <h3 className="font-display text-lg font-bold">
          {title}
        </h3>
      </div>

      {rows.length === 0 ? (
        <p className="p-5 text-sm text-base-content/50">
          No information available.
        </p>
      ) : (
        <div className="divide-y divide-base-300">
          {rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-start justify-between gap-5 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {row.label}
                </p>

                {row.description && (
                  <p className="mt-1 text-xs text-base-content/50">
                    {row.description}
                  </p>
                )}
              </div>

              <div className="max-w-[55%] break-all text-right text-sm text-base-content/65">
                {String(row.value ?? "Not available")}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MetadataTable;
