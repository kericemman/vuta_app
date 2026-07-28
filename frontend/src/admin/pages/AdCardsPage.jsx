import { useState } from "react";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { adPlacementLabels, adPlacements } from "../adminConstants";
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorText,
  IconButton,
  Panel,
  SmallButton,
  StatusPill,
  TableHeader,
} from "../components/ui";

const emptyForm = {
  ctaText: "",
  ctaUrl: "",
  image: null,
  isActive: true,
  placements: ["client_home"],
  sortOrder: "0",
  subtitle: "",
  title: "",
};

const formFromCard = (card) => ({
  ctaText: card.ctaText || "",
  ctaUrl: card.ctaUrl || "",
  image: null,
  isActive: Boolean(card.isActive),
  placements: card.placements?.length ? card.placements : ["client_home"],
  sortOrder: String(card.sortOrder || 0),
  subtitle: card.subtitle || "",
  title: card.title || "",
});

export default function AdCardsPage({
  adCards,
  filter,
  loading,
  onDelete,
  onFilterChange,
  onRefresh,
  onSubmit,
  onToggleActive,
  status,
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setEditingCard(null);
    setForm(emptyForm);
  };

  const startEditing = (card) => {
    setEditingCard(card);
    setForm(formFromCard(card));
  };

  const handleChange = (event) => {
    const { checked, files, name, type, value } = event.target;

    if (type === "file") {
      setForm((current) => ({ ...current, image: files?.[0] || null }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlacementChange = (placement) => {
    setForm((current) => {
      const hasPlacement = current.placements.includes(placement);
      const placements = hasPlacement
        ? current.placements.filter((item) => item !== placement)
        : [...current.placements, placement];

      return {
        ...current,
        placements: placements.length ? placements : current.placements,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("subtitle", form.subtitle);
    formData.append("ctaText", form.ctaText);
    formData.append("ctaUrl", form.ctaUrl);
    formData.append("sortOrder", form.sortOrder);
    formData.append("isActive", String(form.isActive));
    formData.append("placements", form.placements.join(","));

    if (form.image) {
      formData.append("image", form.image);
    }

    await onSubmit({
      formData,
      id: editingCard?.id,
      isEditing: Boolean(editingCard),
    });
    resetForm();
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel>
        <TableHeader
          eyebrow="Marketing"
          subtitle="Upload cards for client, professional, and business home screens."
          title={editingCard ? "Edit ad card" : "Create ad card"}
        />
        {status ? <ErrorText message={status} /> : null}
        <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
          <input
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="title"
            onChange={handleChange}
            placeholder="Title"
            required
            value={form.title}
          />
          <textarea
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="subtitle"
            onChange={handleChange}
            placeholder="Subtitle"
            rows="3"
            value={form.subtitle}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              name="ctaText"
              onChange={handleChange}
              placeholder="CTA text"
              value={form.ctaText}
            />
            <input
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              name="sortOrder"
              onChange={handleChange}
              placeholder="Sort order"
              type="number"
              value={form.sortOrder}
            />
          </div>
          <input
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="ctaUrl"
            onChange={handleChange}
            placeholder="CTA URL"
            value={form.ctaUrl}
          />

          <div className="rounded-lg border border-[#EADBD3] p-3">
            <p className="text-sm font-black text-[#211A20]">Placements</p>
            <div className="mt-3 grid gap-2">
              {adPlacements.map((placement) => (
                <label
                  className="flex items-center gap-2 text-sm text-[#746A71]"
                  key={placement}
                >
                  <input
                    checked={form.placements.includes(placement)}
                    onChange={() => handlePlacementChange(placement)}
                    type="checkbox"
                  />
                  {adPlacementLabels[placement]}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-[#746A71]">
            <input
              checked={form.isActive}
              name="isActive"
              onChange={handleChange}
              type="checkbox"
            />
            Active
          </label>

          <input
            accept="image/jpeg,image/png,image/webp"
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="image"
            onChange={handleChange}
            required={!editingCard}
            type="file"
          />

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-[#741B5D] px-4 py-2 text-sm font-black text-white transition hover:bg-[#F26B5E] disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : editingCard ? "Update card" : "Create card"}
            </button>
            {editingCard ? (
              <button
                className="rounded-lg border border-[#EADBD3] px-4 py-2 text-sm font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]"
                onClick={resetForm}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Panel>

      <Panel>
        <TableHeader
          action={
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                onChange={(event) => onFilterChange(event.target.value)}
                value={filter}
              >
                <option value="">All placements</option>
                {adPlacements.map((placement) => (
                  <option key={placement} value={placement}>
                    {adPlacementLabels[placement]}
                  </option>
                ))}
              </select>
              <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
            </div>
          }
          eyebrow="Cards"
          subtitle="Manage uploaded marketing cards and where they appear."
          title="Ad card library"
        />
        <DataTable loading={loading}>
          <table className="w-full min-w-[940px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
                <th className="py-3 pr-4">Card</th>
                <th className="py-3 pr-4">Placements</th>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adCards.map((card) => (
                <tr className="border-b border-[#F3E8E1]" key={card.id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt=""
                        className="h-16 w-24 rounded-lg object-cover"
                        src={card.imageUrl}
                      />
                      <div>
                        <p className="font-bold">{card.title}</p>
                        <p className="text-xs text-[#746A71]">
                          {card.subtitle || "No subtitle"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {card.placements.map((placement) => (
                        <StatusPill
                          key={placement}
                          label={adPlacementLabels[placement] || placement}
                          tone="neutral"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">{card.sortOrder}</td>
                  <td className="py-3 pr-4">
                    <StatusPill
                      label={card.isActive ? "Active" : "Inactive"}
                      tone={card.isActive ? "success" : "danger"}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <SmallButton label="Edit" onClick={() => startEditing(card)} />
                      <SmallButton
                        label={card.isActive ? "Deactivate" : "Activate"}
                        onClick={() => onToggleActive(card)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        label="Delete"
                        onClick={() => onDelete(card)}
                        tone="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!adCards.length ? (
            <EmptyState message="No ad cards match this view." />
          ) : null}
        </DataTable>
      </Panel>
    </div>
  );
}
