import { useState } from "react";
import {
  FiEye,
  FiImage,
  FiLink,
  FiRefreshCw,
  FiTrash2,
  FiVideo,
} from "react-icons/fi";
import {
  updateAudienceLabels,
  updateAudiences,
  updateStatuses,
} from "../adminConstants";
import { formatDateTime } from "../adminUtils";
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
  audiences: ["client"],
  body: "",
  media: [],
  status: "draft",
  summary: "",
  title: "",
};

const formFromUpdate = (update) => ({
  audiences: update.audiences?.length ? update.audiences : ["client"],
  body: cleanStoredBody(update.body, update.media || []),
  media: update.media || [],
  status: update.status || "draft",
  summary: update.summary || "",
  title: update.title || "",
});

export default function UpdatesPage({
  audienceFilter,
  imageUploading,
  loading,
  onAudienceFilterChange,
  onDelete,
  onRefresh,
  onStatusChange,
  onStatusFilterChange,
  onSubmit,
  onUploadImage,
  status,
  statusFilter,
  updates,
}) {
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [videoCaption, setVideoCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const resetForm = () => {
    setEditingUpdate(null);
    setForm(emptyForm);
    setVideoCaption("");
    setVideoUrl("");
  };

  const startEditing = (update) => {
    setEditingUpdate(update);
    setForm(formFromUpdate(update));
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAudienceChange = (audience) => {
    setForm((current) => {
      if (audience === "all") {
        return {
          ...current,
          audiences: current.audiences.includes("all") ? current.audiences : ["all"],
        };
      }

      const withoutAll = current.audiences.filter((item) => item !== "all");
      const audiences = withoutAll.includes(audience)
        ? withoutAll.filter((item) => item !== audience)
        : [...withoutAll, audience];

      return {
        ...current,
        audiences: audiences.length ? audiences : current.audiences,
      };
    });
  };

  const addMedia = (mediaItem) => {
    setForm((current) => ({
      ...current,
      media: [...current.media, mediaItem],
    }));
  };

  const removeMedia = (mediaItem) => {
    setForm((current) => ({
      ...current,
      media: current.media.filter((item) => item.url !== mediaItem.url),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const mediaItem = await onUploadImage(file);
    addMedia(mediaItem);
  };

  const handleAddVideo = () => {
    const trimmedUrl = videoUrl.trim();

    if (!trimmedUrl) {
      return;
    }

    addMedia({
      caption: videoCaption.trim() || "Watch video",
      type: "video_link",
      url: trimmedUrl,
    });
    setVideoCaption("");
    setVideoUrl("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      id: editingUpdate?.id,
      isEditing: Boolean(editingUpdate),
      payload: {
        audiences: form.audiences,
        body: form.body.trim(),
        media: form.media,
        status: form.status,
        summary: form.summary.trim() || undefined,
        title: form.title.trim(),
      },
    });
    resetForm();
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
      <Panel>
        <TableHeader
          eyebrow="App communication"
          subtitle="Write release notes, promos, safety messages, and feature updates by audience."
          title={editingUpdate ? "Edit update" : "Create update"}
        />
        {status ? <ErrorText message={status} /> : null}

        <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
          <input
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="title"
            onChange={handleChange}
            placeholder="Update title"
            required
            value={form.title}
          />
          <textarea
            className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
            name="summary"
            onChange={handleChange}
            placeholder="Short summary for the update list"
            rows="2"
            value={form.summary}
          />

          <div className="rounded-lg border border-[#EADBD3] p-3">
            <p className="text-sm font-black text-[#211A20]">Audience</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {updateAudiences.map((audience) => (
                <label
                  className="flex items-center gap-2 text-sm text-[#746A71]"
                  key={audience}
                >
                  <input
                    checked={form.audiences.includes(audience)}
                    onChange={() => handleAudienceChange(audience)}
                    type="checkbox"
                  />
                  {updateAudienceLabels[audience]}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#EADBD3] bg-[#FFFDFB] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#211A20]">
                Message body
              </p>
              <p className="text-xs font-bold text-[#746A71]">
                {form.body.length}/15000
              </p>
            </div>
            <textarea
              className="mt-3 min-h-60 w-full resize-y rounded-lg border border-[#EADBD3] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#741B5D]"
              maxLength="15000"
              name="body"
              onChange={handleChange}
              placeholder="Write the update message in normal text."
              required
              value={form.body}
            />
          </div>

          <div className="rounded-lg border border-[#EADBD3] bg-[#FFFDFB] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#211A20]">Media</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#EADBD3] bg-white px-3 py-2 text-xs font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]">
                <FiImage aria-hidden="true" />
                {imageUploading ? "Uploading..." : "Upload image"}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={imageUploading}
                  onChange={handleImageUpload}
                  type="file"
                />
              </label>
            </div>

            <div className="mt-3 rounded-lg border border-[#EADBD3] bg-white p-3">
              <p className="text-xs font-black uppercase tracking-wide text-[#F26B5E]">
                Add video link
              </p>
              <div className="mt-3 grid gap-2">
                <input
                  className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                  onChange={(event) => setVideoCaption(event.target.value)}
                  placeholder="Video label"
                  value={videoCaption}
                />
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                    onChange={(event) => setVideoUrl(event.target.value)}
                    placeholder="https://youtube.com/..."
                    type="url"
                    value={videoUrl}
                  />
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#EADBD3] px-3 py-2 text-sm font-bold text-[#741B5D] transition hover:bg-[#FFF1EA] disabled:opacity-50"
                    disabled={!videoUrl.trim()}
                    onClick={handleAddVideo}
                    type="button"
                  >
                    <FiVideo aria-hidden="true" />
                    Add video
                  </button>
                </div>
              </div>
            </div>

            {form.media.length ? (
              <div className="mt-3 grid gap-2">
                {form.media.map((item) => (
                  <MediaRow
                    item={item}
                    key={`${item.type}-${item.url}`}
                    onRemove={() => removeMedia(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[#EADBD3] bg-white p-4 text-center text-sm font-bold text-[#746A71]">
                No media attached.
              </div>
            )}
          </div>

          <UpdatePreview form={form} />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              name="status"
              onChange={handleChange}
              value={form.status}
            >
              {updateStatuses.map((item) => (
                <option key={item} value={item}>
                  {item === "published" ? "Publish now" : "Save as draft"}
                </option>
              ))}
            </select>
            <button
              className="rounded-lg bg-[#741B5D] px-4 py-2 text-sm font-black text-white transition hover:bg-[#F26B5E] disabled:opacity-60"
              disabled={loading || imageUploading}
            >
              {loading ? "Saving..." : editingUpdate ? "Update" : "Create"}
            </button>
          </div>

          {editingUpdate ? (
            <button
              className="rounded-lg border border-[#EADBD3] px-4 py-2 text-sm font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]"
              onClick={resetForm}
              type="button"
            >
              Cancel editing
            </button>
          ) : null}
        </form>
      </Panel>

      <Panel>
        <TableHeader
          action={
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                onChange={(event) => onAudienceFilterChange(event.target.value)}
                value={audienceFilter}
              >
                <option value="">All audiences</option>
                {updateAudiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {updateAudienceLabels[audience]}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                onChange={(event) => onStatusFilterChange(event.target.value)}
                value={statusFilter}
              >
                <option value="">All status</option>
                {updateStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
            </div>
          }
          eyebrow="Published center"
          subtitle="Manage the messages users see inside their app updates screen."
          title="Update library"
        />
        <DataTable loading={loading}>
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
                <th className="py-3 pr-4">Update</th>
                <th className="py-3 pr-4">Audience</th>
                <th className="py-3 pr-4">Media</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Published</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update) => (
                <tr className="border-b border-[#F3E8E1]" key={update.id}>
                  <td className="py-3 pr-4">
                    <p className="font-bold text-[#211A20]">{update.title}</p>
                    <p className="mt-1 max-w-sm text-xs text-[#746A71]">
                      {update.summary || getBodyExcerpt(update.body)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {update.audiences.map((audience) => (
                        <StatusPill
                          key={audience}
                          label={updateAudienceLabels[audience] || audience}
                          tone={audience === "all" ? "premium" : "neutral"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">
                    {update.media?.length || 0}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusPill
                      label={update.status}
                      tone={update.status === "published" ? "success" : "neutral"}
                    />
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">
                    {formatDateTime(update.publishedAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <SmallButton label="Edit" onClick={() => startEditing(update)} />
                      <SmallButton
                        label={
                          update.status === "published" ? "Unpublish" : "Publish"
                        }
                        onClick={() =>
                          onStatusChange(
                            update,
                            update.status === "published" ? "draft" : "published"
                          )
                        }
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        label="Delete"
                        onClick={() => onDelete(update)}
                        tone="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!updates.length ? (
            <EmptyState message="No app updates match this view." />
          ) : null}
        </DataTable>
      </Panel>
    </div>
  );
}

function MediaRow({ item, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#EADBD3] bg-white p-2">
      {item.type === "image" ? (
        <img
          alt=""
          className="h-14 w-20 rounded-lg object-cover"
          src={item.url}
        />
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1EA] text-[#741B5D]">
          <FiLink aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#211A20]">
          {item.caption || (item.type === "image" ? "Image" : "Video")}
        </p>
        <p className="truncate text-xs text-[#746A71]">{item.url}</p>
      </div>
      <IconButton
        icon={<FiTrash2 />}
        label="Remove media"
        onClick={onRemove}
        tone="danger"
      />
    </div>
  );
}

function UpdatePreview({ form }) {
  const imageItems = form.media.filter((item) => item.type === "image");
  const videoItems = form.media.filter((item) => item.type === "video_link");

  return (
    <div className="rounded-lg border border-[#EADBD3] bg-[#FFF8F3] p-3">
      <div className="flex items-center gap-2 text-sm font-black text-[#211A20]">
        <FiEye className="text-[#741B5D]" aria-hidden="true" />
        App preview
      </div>

      <div className="mt-3 rounded-lg border border-[#EADBD3] bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-[#F26B5E]">
          Vuta update
        </p>
        <h3 className="mt-2 text-xl font-black leading-tight text-[#211A20]">
          {form.title || "Update title"}
        </h3>
        {form.summary ? (
          <p className="mt-2 text-sm leading-6 text-[#746A71]">{form.summary}</p>
        ) : null}

        {imageItems.length ? (
          <div className="mt-4 grid gap-3">
            {imageItems.map((item) => (
              <img
                alt=""
                className="aspect-video w-full rounded-lg object-cover"
                key={item.url}
                src={item.url}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 text-sm leading-6 text-[#211A20]">
          {getPreviewLines(form.body).length ? (
            getPreviewLines(form.body).map((line, index) => (
              <PreviewLine key={`${line}-${index}`} line={line} />
            ))
          ) : (
            <p className="text-[#746A71]">Message body preview</p>
          )}
        </div>

        {videoItems.length ? (
          <div className="mt-4 grid gap-2">
            {videoItems.map((item) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-[#EADBD3] bg-[#FFF8F3] p-3"
                key={item.url}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#741B5D]">
                  <FiVideo aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#211A20]">
                    {item.caption || "Watch video"}
                  </p>
                  <p className="truncate text-xs text-[#746A71]">{item.url}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PreviewLine({ line }) {
  const trimmed = line.trim();

  if (trimmed.startsWith("- ")) {
    return (
      <div className="flex gap-2">
        <span className="text-[#741B5D]">•</span>
        <p>{cleanInlineMarkdown(trimmed.replace(/^-+\s*/, ""))}</p>
      </div>
    );
  }

  if (trimmed.startsWith("##")) {
    return (
      <p className="pt-1 text-base font-black">
        {cleanInlineMarkdown(trimmed.replace(/^#+\s*/, ""))}
      </p>
    );
  }

  return <p>{cleanInlineMarkdown(trimmed)}</p>;
}

const getPreviewLines = (body = "") =>
  body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.match(/^!\[.*?\]\(.*?\)$/));

const cleanInlineMarkdown = (text = "") =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`/g, "");

const cleanStoredBody = (body = "", media = []) => {
  const mediaUrls = new Set(media.map((item) => item.url).filter(Boolean));

  return body
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      const imageUrl = trimmed.match(/^!\[.*?\]\((.*?)\)$/)?.[1];
      const linkUrl = trimmed.match(/^\[.*?\]\((.*?)\)$/)?.[1];

      return !mediaUrls.has(imageUrl) && !mediaUrls.has(linkUrl);
    })
    .join("\n")
    .trim();
};

const getBodyExcerpt = (body = "") =>
  cleanInlineMarkdown(body).replace(/[#*_`[\]()!-]/g, "").slice(0, 120) ||
  "No summary";
